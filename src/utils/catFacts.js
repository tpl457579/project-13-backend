import 'dotenv/config';
import mongoose from 'mongoose';
import CatFact from '../api/models/catFacts.js'; // Ensure this path is correct

const catFactsArray = [
  "Annually in Asia about four million cats are eaten.",
  "Cats spend on average two-thirds of the day sleeping, that is, a nine-year-old cat spent only three years without sleep.",
  "Scientists have proven that cats, unlike dogs, do not like sweets.",
  "As a rule, in cats, the left paw is considered active, and in cats – right.",
  "Because of the structure of the claws, cats cannot climb a tree upside down.",
  "Unlike dogs, cats can make about 100 different sounds.",
  "Emotions are answered by the same part of the brain as that of a person, so the brain of a cat is as similar as possible to a human one.",
  "About 500 million cats live on the planet.",
  "There are 40 different breeds cats.",
  "To sew a coat, you will need 25 cat skins.",
  "The oldest domestic cat was found in a 9500-year-old grave on the island of Cyprus.",
  "It is generally accepted that the first civilization that tamed cats was Ancient Egypt.",
  "Pope Innocent VIII, during the Spanish Inquisition, mistook cats for messengers of the devil, so thousands of cats were burned in those days, which eventually led to the plague.",
  "In the Middle Ages, cats were believed to be associated with black magic.",
  "A cat named Astrocat from France became the first cat to travel into space. And that was in 1963.",
  "According to the Jewish legend, Noah asked God to protect the food on the ark from rats, and in response, God ordered the lion to sneeze, and a cat jumped out of his mouth.",
  "At short distances, a cat can develop a speed of about 50 kilometers per hour.",
  "A cat is able to jump to a height that exceeds its height five times.",
  "Cats rub against people not only because of outbursts of affection, but also in order to mark the territory with glands.",
  "When cats purr, they close the muscles of the larynx, and air enters about 25 times per second.",
  "In ancient Egypt, when a cat died, its owners mourned the animal and shaved their eyebrows.",
  "In 1888, three hundred thousand cat mummies were found in Egyptian cemeteries.",
  "The maximum number of kittens that a cat gave birth at one time is 19.",
  "The death penalty was the smuggling of cats from Ancient Egypt.",
  "The group of animals that include modern cats appeared 12 million years ago.",
  "The Amur tiger is the largest wild cat, and it weighs up to 320 kg.",
  "The black-footed cat is the smallest wild cat, and their maximum size is 50 centimeters in length.",
  "In Australia and Great Britain, it is considered a good sign to meet a black cat on the way.",
  "The most popular cat breed in the world is the Persian, and the Siamese breed takes the second line.",
  "Siamese cats tend to look sideways, and the structure of their optic nerves is to blame.",
  "Turkish Van is a cat breed that loves to swim. The coat of such cats is waterproof.",
  "50000 dollars is the maximum amount of money that had to be paid for a cat.",
  "A cat should have about 12 whiskers on each side of the muzzle.",
  "Cats see perfectly in the dark.",
  "The peripheral vision of cats has a larger angle than that of a person.",
  "All cats are color blind, they do not distinguish colors, and therefore the green grass seems red to them.",
  "Cats have the ability to find their way home.",
  "The jaws of a cat cannot move from one side to the other.",
  "Cats do not communicate with each other with the help of meows. They use this tool to communicate with people.",
  "Cats have excellent back flexibility. This is facilitated by 53 loose-fitting vertebrae.",
  "In a state of calm, all cats hide their claws, and the only exception is the cheetah.",
  "Most cats on the planet were short-haired, until then until they began to cross different breeds.",
  "Cats can turn their ears 180 degrees thanks to the 32-mind muscles in the ear.",
  "Growth hormone in cats is released during sleep, just like in humans.",
  "There are 20,155 hairs per square centimeter of a cat.",
  "A cat named Himmy was listed in the Guinness Book of Records as the heaviest domestic cat. His weight was 21 kilograms.",
  "A cat named Crème Puff was listed in the Guinness Book of Records. He was the oldest cat who lived for 38 years.",
  "In Scotland there is a monument to a cat who caught 30,000 mice in his life.",
  "In 1750, cats were brought to America to fight rodents.",
  "In 1871, in The first ever cat show was held in London.",
  "The first cat in the cartoon was Felix the cat in 1919.",
  "A cat has approximately 240 bones in its body.",
  "Cats don’t have collarbones, so they can easily fit into small holes.",
  "The heartbeat of a cat reaches 140 beats per minute. This is twice as much as a human heartbeat.",
  "Cats do not have sweat glands throughout the body. They sweat only through their paws.",
  "The pattern of the surface of the nose in cats is unique, as are fingerprints in humans.",
  "An adult cat has 30 teeth, and kittens – 26.",
  "Dusty the cat holds the record for the number of kittens born. Their number is 420.",
  "Cats are more sensitive to vibration than humans.",
  "The claws on the front paws of a cat are much sharper than on the back.",
  "Scientists prefer cats in research, not dogs.",
  "Ailurophilia is called excessive love for cats.",
  "People who have a cat at home, by 30% reduce the likelihood of a stroke or heart attack.",
  "Despite the fact that dogs are considered smarter than cats, cats are able to solve more complex problems.",
  "It is believed that Isaac Newton invented the cat door.",
  "Australians are considered the most cat-loving nation. 90% of the inhabitants of the mainland have cats.",
  "A kitten, like a child, loses milk teeth.",
  "The first president of America, George Washington, was the owner of four cats.",
  "A cat’s whiskers serve her to understand the dimensions, that is, they help the animal understand which gap it can crawl into.",
  "Cats can recognize the voice of their owners.",
  "When falling, a cat always lands on its paws, therefore, even falling from the ninth floor, the cat is able to survive.",
  "There are opinions that cats feel sick human organs and are able to cure them.",
  "Cats determine the temperature of food with their nose so as not to burn themselves.",
  "Cats like to drink running water.",
  "In some countries of the world, cats receive pension benefits in food equivalent.",
  "Domestic cats often have a vertical tail, while wild ones, as a rule, have it lowered.",
  "A cat named Oscar was wrecked on three warships and each time he escaped on wooden planks.",
  "In the European Union, it is forbidden to cut the claws on the paws of cats, but in the USA it is allowed.",
  "When a cat brings its owner a dead bird or mouse, it means that she teaches him to hunt.",
  "In Islamic culture, a domestic cat is considered an honorable animal.",
  "Scientists believe that cats can improve a person’s mood.",
  "A popular component of energy drinks – taurine is needed for cat foods. Without it, animals lose their teeth, fur and eyesight.",
  "If a cat rubs its head against a person, it means that she trusts him.",
  "In the English city of York, there are 22 statues of cats on the roofs of houses.",
  "Adult cats cannot be fed milk, as they cannot digest lactose.",
  "There is a cat in Japan – a cafe where you can have a good time with cats.",
  "Domestic cats do not like to drink water from a bowl next to their food, as they consider it dirty, and therefore they look for a source of water in other places at home.",
  "Cats can drink sea water thanks to the very efficient functioning of the kidneys.",
  "Savannah cats can be tamed and made pets.",
  "In 1879 in Belgium, cats were used to deliver mail.",
  "At night, Disneyland becomes a home for roaming cats, because they keep mice under control.",
  "Cats are blamed for the complete extinction of about 33 animal species.",
  "Copy Cat is the first successfully cloned cat in the world.",
  "Old cats meow much more because they develop Alzheimer’s disease.",
  "Cats can hear ultrasonic noise.",
  "Cat named Stubbs is 15 years old was the mayor of the city of Takitna, in Alaska.",
  "Cats have 300 million neurons, while dogs have only 160 million.",
  "In England, in warehouses, cat grain is used in as guards against mice.",
  "Cats wag their tail because of internal conflict, that is, one desire blocks another.",
  "If the cat is near the owner, and her tail trembles, then this means that the animal shows the highest degree of love."
];

const seedFacts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Convert strings to objects that match your schema field (text)
    const factsToImport = catFactsArray.map(factString => ({
      text: factString
    }));

    // 2. Clear old facts (optional) and insert new ones
    await CatFact.deleteMany({});
    await CatFact.insertMany(factsToImport);

    console.log(`✅ Success: ${factsToImport.length} cat facts imported!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding facts:', err.message);
    process.exit(1);
  }
}

seedFacts();