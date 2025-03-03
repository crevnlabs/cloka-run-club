import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, "../public/images");

// Create the images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// List of placeholder images to download
const images = [
  {
    name: "hero-image.jpg",
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
  },
  {
    name: "about-1.jpg",
    url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "about-2.jpg",
    url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "runner-of-the-week.jpg",
    url: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "past-runner-1.jpg",
    url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "past-runner-2.jpg",
    url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "past-runner-3.jpg",
    url: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-1.jpg",
    url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-2.jpg",
    url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-3.jpg",
    url: "https://images.unsplash.com/photo-1565693413579-8a3c9944d2a3?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-4.jpg",
    url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-5.jpg",
    url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-6.jpg",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-7.jpg",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-8.jpg",
    url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "product-9.jpg",
    url: "https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?q=80&w=800&auto=format&fit=crop",
  },
];

// Download each image
images.forEach((image) => {
  const filePath = path.join(imagesDir, image.name);
  const file = fs.createWriteStream(filePath);

  https
    .get(image.url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log(`Downloaded ${image.name}`);
      });
    })
    .on("error", (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      console.error(`Error downloading ${image.name}: ${err.message}`);
    });
});
