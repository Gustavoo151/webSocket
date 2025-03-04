import { Request, Response } from "express";
import { MessagesController } from "../../controllers/MessageController";
import { MessagesService } from "../../services/MessagesService";

// Mock the MessagesService
jest.mock("../services/MessagesService");

describe("MessageController", () => {
  let messagesController: MessagesController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockMessagesService: jest.Mocked<MessagesService>;

  beforeEach(() => {
    messagesController = new MessagesController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
    };

    // Clear all mock implementations and reset mock calls
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should create a message and return it as JSON", async () => {
      // Arrange
      const mockMessage = {
        id: "123",
        admin_id: "1",
        text: "Hello",
        user_id: "2",
        created_at: new Date(),
      };
      mockRequest.body = { admin_id: "1", text: "Hello", user_id: "2" };

      // Mock MessagesService create method
      MessagesService.prototype.create = jest
        .fn()
        .mockResolvedValue(mockMessage);

      // Act
      await messagesController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(MessagesService.prototype.create).toHaveBeenCalledWith({
        admin_id: "1",
        text: "Hello",
        user_id: "2",
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessage);
    });
  });

  describe("showByUser", () => {
    test("should return a list of messages for a specific user", async () => {
      // Arrange
      const mockMessages = [
        {
          id: "1",
          admin_id: "1",
          text: "Hello",
          user_id: "user1",
          created_at: new Date(),
        },
        {
          id: "2",
          admin_id: "1",
          text: "How are you?",
          user_id: "user1",
          created_at: new Date(),
        },
      ];
      mockRequest.params = { id: "user1" };

      // Mock MessagesService listByUser method
      MessagesService.prototype.listByUser = jest
        .fn()
        .mockResolvedValue(mockMessages);

      // Act
      await messagesController.showByUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(MessagesService.prototype.listByUser).toHaveBeenCalledWith(
        "user1"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockMessages);
    });
  });
});
