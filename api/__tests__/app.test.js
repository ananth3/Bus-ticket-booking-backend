const app = require("../index");
const supertest = require("supertest");
const request = supertest(app);

describe("Api testing", () => {
  it("POST create a new ticket", async () => {
    const response = await request.post("/api/ticket").send({
      seat_number: 22,
      passenger: {
        username: "chinu",
        email: "chinu@gmail.com",
        phone: "9003657836",
      },
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Ticket booked successfully");
  }, 10000);

  it("POST create a new ticket", async () => {
    const response = await request.post("/api/ticket").send({
      seat_number: 1,
      passenger: {
        username: "poorna",
        email: "poorna@gmail.com",
        phone: "8428540526",
      },
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Ticket already booked");
  }, 7000);

  it("POST create a new ticket", async () => {
    const response = await request.post("/api/ticket").send({
      seat_number: 45,
      passenger: {
        username: "poorna",
        email: "poorna@gmail.com",
        phone: "8428540526",
      },
    });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      "please select seat number from 1 to 40"
    );
  }, 7000);

  it("PUT update ticket open/close", async () => {
    const response = await request
      .put("/api/ticket/61a77e60a722fba9ad83b26b")
      .send({
        is_booked: false,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Ticket updated successfully");
  }, 7000);

  it("PUT update ticket open/close", async () => {
    const response = await request
      .put("/api/ticket/61a77e60a722fba9ad83b26a")
      .send({
        is_booked: false,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Ticket not found");
  }, 7000);

  it("GET view ticket status", async () => {
    const response = await request.get("/api/ticket/61a7560f95da0553ee962982");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Open Ticket (Not Booked Ticket)");
  }, 7000);

  it("GET view ticket status (ticket not found)", async () => {
    const response = await request.get("/api/ticket/61a495c27b83b644e8595f51");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Ticket not found");
  }, 7000);

  it("GET get all open tickets", async () => {
    const response = await request.get("/api/tickets/open");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("List of all open tickets");
  }, 7000);

  it("GET get all close tickets", async () => {
    const response = await request.get("/api/tickets/close");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("List of all close tickets");
  }, 7000);

  it("GET view passenger details of the ticket", async () => {
    const response = await request.get(
      "/api/ticket/61a7560f95da0553ee962982/passenger-details"
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Passenger found successfully");
  }, 7000);

  it("GET view passenger details of the ticket", async () => {
    const response = await request.get(
      "/api/ticket/61a495c27b83b644e8595f51/passenger-details"
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Ticket not found");
  }, 7000);

  it("POST Admin reset the server", async () => {
    const response = await request.post("/api/tickets/reset").send({
      username: "admin",
      password: "admin@123",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Reset to open tickets successfully");
  }, 7000);

  it("POST Admin reset the server", async () => {
    const response = await request.post("/api/tickets/reset").send({
      username: "admin",
      password: "admin@1",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("username or password is incorrect");
  }, 7000);

  it("GET view ticket status (500 - Internal server error)", async () => {
    const response = await request.get(
      "/api/test/ticket/61a495c27b83b644e8595f5"
    );
    expect(response.status).toBe(500);
  }, 7000);
});
