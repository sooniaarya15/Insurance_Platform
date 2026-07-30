const prisma = require("../config/db");

// ADMIN/AGENT — Admin sees everyone, Agent sees only their assigned customers
async function getCustomers(req, res) {
  try {
    const { search } = req.query;

    let where = {};
    if (req.user.role === "AGENT") {
      where.agentId = req.user.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: { agent: { select: { id: true, name: true } } },
      orderBy: { id: "desc" },
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching customers", error: err.message });
  }
}

async function getCustomerById(req, res) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: { policies: { include: { plan: true } }, documents: true, agent: true },
    });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Agent can only view their own assigned customers
    if (req.user.role === "AGENT" && customer.agentId !== req.user.id) {
      return res.status(403).json({ message: "Access denied — this customer is not assigned to you" });
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error fetching customer", error: err.message });
  }
}

async function updateCustomer(req, res) {
  try {
    const { name, dob, phone, address, email, agentId } = req.body;

    const data = { name, phone, address, email, dob: dob ? new Date(dob) : undefined };
    // Only Admin can reassign an agent
    if (req.user.role === "ADMIN" && agentId !== undefined) {
      data.agentId = agentId ? Number(agentId) : null;
    }

    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error updating customer", error: err.message });
  }
}

async function deleteCustomer(req, res) {
  try {
    await prisma.customer.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting customer", error: err.message });
  }
}

// CUSTOMER — view own profile
async function getMyProfile(req, res) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
      include: { policies: { include: { plan: true } }, agent: { select: { name: true, email: true } } },
    });
    if (!customer) return res.status(404).json({ message: "Customer profile not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
}

async function updateMyProfile(req, res) {
  try {
    const { name, phone, address, dob } = req.body;
    const customer = await prisma.customer.update({
      where: { userId: req.user.id },
      data: { name, phone, address, dob: dob ? new Date(dob) : undefined },
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getMyProfile,
  updateMyProfile,
};