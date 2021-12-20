const router = require("express").Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// create a new ticket
router.post(
  "/ticket",
  check("seat_number").notEmpty().withMessage("seat number is required"),
  check("seat_number")
    .isNumeric()
    .withMessage("Invalid seat number, please select seat number from 1 to 40"),
  check("seat_number")
    .isFloat({ min: 1, max: 40 })
    .withMessage("please select seat number from 1 to 40"),
  check("passenger").notEmpty().withMessage("passenger is required"),
  check("passenger.username").notEmpty().withMessage("username is required"),
  check("passenger.username")
    .isLength({ min: 5 })
    .withMessage("username must be at least 5 characters"),
  check("passenger.email").notEmpty().withMessage("email is required"),
  check("passenger.email").isEmail().withMessage("email is not valid"),
  check("passenger.phone").notEmpty().withMessage("Phone number is required"),
  check("passenger.phone")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number is not valid"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ticket = await Ticket.findOne({
        seat_number: req.body.seat_number,
      });
      if (!ticket || (ticket && !ticket.is_booked)) {
        const newTicket = new Ticket({ seat_number: req.body.seat_number });

        const user = await User.findOne({ email: req.body.passenger.email });
        let username;
        if (!user) {
          const user = new User(req.body.passenger);
          await user.save();
          newTicket.passenger = user._id;
          username = user.username;
        } else {
          newTicket.passenger = user._id;
          username = user.username;
        }
        const savedTicket = await newTicket.save();
        const { seat_number } = savedTicket;
        res.status(200).json({
          status: 200,
          message: "Ticket booked successfully",
          data: { seat_number: seat_number, passenger: username },
        });
      } else {
        res.status(200).json({ status: 200, message: "Ticket already booked" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// update a ticket open/close
router.put("/ticket/:id", async (req, res) => {
  try {
    const ticketValid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!ticketValid) {
      return res.status(404).json({
        status: 404,
        message: "Invalid Ticket id",
      });
    }
    const ticket = await Ticket.findOne({ _id: req.params.id });
    if (!ticket) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }
    if (req.body.userId === ticket.passenger.toString()) {
      await ticket.updateOne({ $set: req.body });
      res.status(200).json({
        status: 200,
        message: "Ticket updated successfully",
      });
    } else {
      res.status(400).json({
        status: 400,
        message: "No permission to update this ticket",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// view a ticket status
router.get("/ticket/:id", async (req, res) => {
  try {
    const ticketValid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!ticketValid) {
      return res.status(404).json({
        status: 404,
        message: "Invalid Ticket id",
      });
    }
    const ticket = await Ticket.findOne({ _id: req.params.id });
    if (!ticket) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }
    if (ticket.is_booked) {
      res.status(200).json({
        status: 200,
        message: "Closed Ticket (Booked Ticket)",
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Open Ticket (Not Booked Ticket)",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get all the open ticket list
router.get("/tickets/open", async (req, res) => {
  try {
    const openTicket = await Ticket.find({ is_booked: false });
    res.status(200).json({
      status: 200,
      message: "List of all open tickets",
      data: openTicket,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get all the close ticket list
router.get("/tickets/close", async (req, res) => {
  try {
    const closeTicket = await Ticket.find({ is_booked: true });
    res.status(200).json({
      status: 200,
      message: "List of all close tickets",
      data: closeTicket,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// view details of person owning the ticket
router.get("/ticket/:id/passenger-details", async (req, res) => {
  try {
    const ticketValid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!ticketValid) {
      return res.status(404).json({
        status: 404,
        message: "Invalid Ticket id",
      });
    }
    const ticket = await Ticket.findOne({ _id: req.params.id });
    if (!ticket) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }
    const user = await User.findOne({ _id: ticket.passenger });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Passenger not found",
      });
    }
    const { username, email, phone } = user;
    res.status(200).json({
      status: 200,
      message: "Passenger found successfully",
      data: { username: username, email: email, phone: phone },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Admin reset the server
router.post("/tickets/reset", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 400,
        message: "username and password are required",
      });
    }
    const { username, password } = req.body;
    if (
      username === process.env.username &&
      password === process.env.password
    ) {
      const tickets = Ticket.find({});
      (await tickets).forEach(openTicket);
      async function openTicket(ticket) {
        const ticket_data = await Ticket.findById(ticket._id);
        ticket_data.is_booked = false;
        await ticket_data.save();
      }
      res.status(200).json({
        status: 200,
        message: "Reset to open tickets successfully",
      });
    } else {
      res.status(400).json({
        status: 400,
        message: "username or password is incorrect",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
