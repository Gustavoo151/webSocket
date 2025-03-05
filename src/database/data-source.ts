import { DataSource } from "typeorm";
import path from "path";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: path.resolve(__dirname, "database.sqlite"),
  entities: ["./src/entities/**.ts"],
  migrations: ["./src/database/migrations/**.ts"],
});

export const initialize = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    throw error;
  }
};
