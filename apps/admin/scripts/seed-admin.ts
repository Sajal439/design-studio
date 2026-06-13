import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("--- Setup Master Admin ---");
  
  rl.question('Enter Admin Email (default: admin@goeltraders.in): ', async (emailInput) => {
    const email = emailInput.trim() || "admin@goeltraders.in";
    
    rl.question('Enter Admin Name (default: Master Admin): ', async (nameInput) => {
      const name = nameInput.trim() || "Master Admin";
      
      rl.question('Enter Admin Password (default: admin123): ', async (passwordInput) => {
        const password = passwordInput.trim() || "admin123";
        
        console.log(`\nCreating account for ${email}...`);
        
        try {
          const passwordHash = await bcrypt.hash(password, 10);
          
          const user = await prisma.adminUser.upsert({
            where: { email },
            update: {
              passwordHash,
              name,
              role: "admin"
            },
            create: {
              email,
              passwordHash,
              name,
              role: "admin"
            }
          });
          
          console.log("\nSuccess! Admin account created:");
          console.log(`Email: ${user.email}`);
          console.log(`Name: ${user.name}`);
          console.log(`Role: ${user.role}`);
        } catch (error) {
          console.error("\nError creating account:", error);
        } finally {
          await prisma.$disconnect();
          rl.close();
        }
      });
    });
  });
}

main();
