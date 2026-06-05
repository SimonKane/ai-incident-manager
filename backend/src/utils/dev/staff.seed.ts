import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { Staff } from "../../models/staff.model";

dotenv.config({ quiet: true });

async function seedDatabaseWithStaff() {
  const url = process.env.MONGODB_URI;

  try {
    if (!url) throw new Error("Missing database connection string");
    await mongoose.connect(url, { dbName: "incidents" });
    await Promise.all([Staff.deleteMany({})]);

    const department = ["devops", "backend", "frontend", "database"];

    const staffDocs = Array.from({ length: 5 }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      return {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme.com`,
        department: faker.person.jobTitle(),
        organization: "Acme",
      };
    });

    await Staff.insertMany(staffDocs);
    console.log("Seeded database completed");
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
}

seedDatabaseWithStaff();
