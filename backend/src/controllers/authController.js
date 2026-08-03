const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public self-registration — always creates a CUSTOMER account
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Name should contain only letters (no numbers or special characters)" });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        customer: { create: { name, email } },
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// ADMIN-only: create AGENT or ADMIN accounts
async function createStaff(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }
    if (!["AGENT", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "role must be AGENT or ADMIN" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res.status(201).json({
      message: `${role} account created successfully`,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// ADMIN/AGENT: create a login-enabled CUSTOMER account
async function createCustomerAccount(req, res) {
  try {
    const { name, email, password, phone, address, dob, agentId } = req.body;

    console.log("DEBUG — createCustomerAccount received:", { name, email, password: password ? `(${password.length} chars)` : "MISSING" });

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Name should contain only letters (no numbers or special characters)" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("DEBUG — hashed password generated:", hashedPassword.substring(0, 20) + "...");

    let finalAgentId = null;
    if (req.user.role === "AGENT") {
      finalAgentId = req.user.id;
    } else if (req.user.role === "ADMIN" && agentId) {
      finalAgentId = Number(agentId);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        customer: {
          create: {
            name,
            email,
            phone,
            address,
            dob: dob ? new Date(dob) : null,
            agentId: finalAgentId,
          },
        },
      },
    });

    console.log("DEBUG — customer account created with id:", user.id, "email:", user.email);

    res.status(201).json({
      message: "Customer account created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("DEBUG — error in createCustomerAccount:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getAgents(req, res) {
  try {
    const agents = await prisma.user.findMany({
      where: { role: "AGENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: "Error fetching agents", error: err.message });
  }
}

// Login — with debug logging to trace the exact failure point
async function login(req, res) {
  try {
    const { email, password } = req.body;

    console.log("DEBUG — login attempt for email:", JSON.stringify(email));

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("DEBUG — user found:", user ? user.email : "NOT FOUND");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("DEBUG — stored password hash:", user.password ? user.password.substring(0, 20) + "..." : "MISSING/NULL");
    console.log("DEBUG — password entered (length):", password ? password.length : "MISSING");

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("DEBUG — password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("DEBUG — error in login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

    res.json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  register,
  login,
  resetPassword,
  createStaff,
  createCustomerAccount,
  getAgents,
};