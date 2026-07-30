const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public self-registration — always creates a CUSTOMER account (no agent assigned yet)
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

// ADMIN or AGENT: create a login-enabled CUSTOMER account on someone's behalf.
// If an AGENT creates it, the customer is auto-assigned to that agent.
// If an ADMIN creates it, they may optionally pass agentId to assign one.
async function createCustomerAccount(req, res) {
  try {
    const { name, email, password, phone, address, dob, agentId } = req.body;

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

    // Decide which agent (if any) this customer belongs to
    let finalAgentId = null;
    if (req.user.role === "AGENT") {
      finalAgentId = req.user.id; // agent creating it is auto-assigned
    } else if (req.user.role === "ADMIN" && agentId) {
      finalAgentId = Number(agentId); // admin optionally assigns one
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

    res.status(201).json({
      message: "Customer account created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// ADMIN-only: list all agents (for assignment dropdowns)
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

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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
    console.error(err);
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