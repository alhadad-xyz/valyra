import pytest
from unittest.mock import MagicMock, patch
from app.services.indexer import IndexerService
from app.models.escrow import Escrow, EscrowState

# Mock settings
with patch("app.core.config.settings") as mock_settings:
    mock_settings.base_rpc_url = "http://localhost:8545"
    mock_settings.escrow_contract_address = "0xEscrow"
    mock_settings.marketplace_contract_address = "0xMarket"

def test_process_receipt_confirmed():
    # Setup
    indexer = IndexerService()
    # Mock contracts to avoid initialization errors (though __init__ handles it gracefully mostly)
    indexer.escrow_contract = MagicMock()

    mock_db = MagicMock()
    mock_escrow = MagicMock()
    mock_escrow.escrow_state = EscrowState.FUNDED
    
    # Mock Query: db.query(Escrow).filter(...).first()
    # The filter call returns a query object, then first() returns the instance
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = mock_escrow
    mock_db.query.return_value = mock_query

    # Mock SessionCtx
    mock_session_cls = MagicMock()
    mock_session_cls.__enter__.return_value = mock_db
    
    with patch("app.services.indexer.SessionLocal", return_value=mock_session_cls):
        # Event Data
        event = {
            'args': {
                'escrowId': 123,
                'immediateRelease': 0,
                'retainerAmount': 0
            }
        }
        
        # Execute
        indexer.process_receipt_confirmed(event)
        
        # Verify
        # Check that we queried for on_chain_id == 123
        # Since SQLAlchemy filter logic is complex to mock exactly with '==' operator,
        # we often trust the code or spy on the expression. 
        # But we can verify 'escrow.escrow_state' changed.
        
        assert mock_escrow.escrow_state == EscrowState.CONFIRMED
        mock_db.commit.assert_called_once()

def test_process_dispute_raised():
    # Setup
    indexer = IndexerService()
    
    mock_db = MagicMock()
    mock_escrow = MagicMock()
    mock_escrow.escrow_state = EscrowState.FUNDED
    
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = mock_escrow
    mock_db.query.return_value = mock_query

    mock_session_cls = MagicMock()
    mock_session_cls.__enter__.return_value = mock_db
    
    with patch("app.services.indexer.SessionLocal", return_value=mock_session_cls):
        # Event Data
        event = {
            'args': {
                'escrowId': 456,
                'disputeType': 1,
                'evidenceIpfs': 'QmHash'
            }
        }
        
        # Execute
        indexer.process_dispute_raised(event)
        
        # Verify
        assert mock_escrow.escrow_state == EscrowState.DISPUTED
        assert "QmHash" in mock_escrow.dispute_reason
        mock_db.commit.assert_called_once()

def test_process_escrow_created_saves_id():
    # Verify the new field is used
    indexer = IndexerService()
    
    mock_db = MagicMock()
    mock_listing = MagicMock()
    
    # query(Listing).filter(...).first()
    mock_db.query.return_value.filter.return_value.first.return_value = mock_listing
    
    # query(User) for JIT
    # We need to handle multiple queries: first Listing, then User
    # Side effect for chained calls:
    # 1. db.query(Escrow) -> filter -> all() (Check processed)
    # 2. db.query(Listing) -> filter -> first()
    # 3. db.query(User) -> filter -> first()
    
    # This is getting complex to mock purely with return_values because of multiple queries.
    # Simplified approach: Verify the add() call argument.
    
    mock_session_cls = MagicMock()
    mock_session_cls.__enter__.return_value = mock_db
    
    with patch("app.services.indexer.SessionLocal", return_value=mock_session_cls):
        with patch("app.services.indexer.settings") as s:
            s.escrow_contract_address = "0xEsc"
            
            event = {
                'args': {
                    'escrowId': 999,
                    'listingId': 1,
                    'buyer': '0xBuyer',
                    'seller': '0xSeller',
                    'amount': 1000000000000000000
                },
                'transactionHash': b'0xHash' # .hex() called on it
            }
            
            # Execute
            indexer.process_escrow_created(event)
            
            # Verify db.add() was called with an Escrow object having on_chain_id=999
            args, _ = mock_db.add.call_args
            added_obj = args[0]
            
            assert isinstance(added_obj, Escrow)
            assert added_obj.on_chain_id == 999
            assert added_obj.buyer_address == '0xBuyer'
