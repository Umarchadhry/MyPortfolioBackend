import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.createContactMessage(validatedData);

      res.status(201).json({
        success: true,
        message: "Contact message received successfully",
        data: contactMessage,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }

      console.error("Error creating contact message:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send message. Please try again.",
      });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
