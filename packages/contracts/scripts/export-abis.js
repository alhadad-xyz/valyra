import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Export ABIs from Hardhat artifacts to deployment/abi directory
 * This script extracts ABI JSON from compiled artifacts and saves them
 * in a flat structure for easy access by backend and frontend.
 */
async function exportABIs() {
    const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
    const outputDir = path.join(__dirname, "..", "deployment", "abi");

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Clear existing ABIs
    const existingFiles = fs.readdirSync(outputDir);
    existingFiles.forEach((file) => {
        if (file.endsWith(".json")) {
            fs.unlinkSync(path.join(outputDir, file));
        }
    });

    console.log("🔍 Scanning for contract artifacts...");

    // Recursively find all .json files in artifacts/contracts
    function findArtifacts(dir) {
        const files = [];

        if (!fs.existsSync(dir)) {
            console.log("⚠️  No artifacts directory found. Run 'npx hardhat compile' first.");
            return files;
        }

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                files.push(...findArtifacts(fullPath));
            } else if (entry.isFile() && entry.name.endsWith(".json")) {
                // Skip .dbg.json files (debug info)
                if (!entry.name.endsWith(".dbg.json")) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }

    const artifactFiles = findArtifacts(artifactsDir);

    if (artifactFiles.length === 0) {
        console.log("⚠️  No contract artifacts found.");
        return;
    }

    console.log(`📦 Found ${artifactFiles.length} contract artifact(s)`);

    let exportedCount = 0;

    for (const artifactPath of artifactFiles) {
        try {
            const artifactContent = fs.readFileSync(artifactPath, "utf-8");
            const artifact = JSON.parse(artifactContent);

            // Extract contract name from artifact
            const contractName = artifact.contractName;

            if (!contractName) {
                console.log(`⚠️  Skipping ${path.basename(artifactPath)} - no contract name found`);
                continue;
            }

            // Extract ABI
            const abi = artifact.abi;

            if (!abi || !Array.isArray(abi)) {
                console.log(`⚠️  Skipping ${contractName} - no valid ABI found`);
                continue;
            }

            // Write ABI to output directory
            const outputPath = path.join(outputDir, `${contractName}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

            console.log(`✅ Exported ${contractName}.json`);
            exportedCount++;
        } catch (error) {
            console.error(`❌ Error processing ${artifactPath}:`, error);
        }
    }

    console.log(`\n🎉 Successfully exported ${exportedCount} ABI(s) to ${outputDir}`);
}

// Run the export
exportABIs().catch((error) => {
    console.error("❌ Failed to export ABIs:", error);
    process.exit(1);
});
