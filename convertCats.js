import fs from "fs";

// Load your cats file
import { cats } from "./cats.js"; // adjust path if needed

function convertNumbersToStrings(list) {
  const numericFields = [
    "affectionLevel",
    "childFriendly",
    "dogFriendly",
    "energyLevel",
    "grooming",
    "sheddingLevel",
    "strangerFriendly"
  ];

  return list.map(cat => {
    const updated = { ...cat };

    numericFields.forEach(field => {
      if (updated[field] !== undefined && updated[field] !== null) {
        updated[field] = String(updated[field]);
      }
    });

    return updated;
  });
}

const converted = convertNumbersToStrings(cats);

// Write back into the same file
const output =
  "export const cats = " + JSON.stringify(converted, null, 2) + ";\n";

fs.writeFileSync("./cats.js", output, "utf8");

console.log("✔ cats.js updated with string values");
