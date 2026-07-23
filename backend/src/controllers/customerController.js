const prisma = require("../config/db");

async function createCustomer(req, res) {
  try {
    const { name, dob, phone, address, email } = req.body;
    const customer = await prisma.customer.create({
      data: {
        name,
        dob: dob ? new Date(dob) : null,
        phone,
        address,
        email,
      },
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error creating customer", error: err.message });
  }
}

async function getCustomers(req, res) {
  try {
    const { search } = req.query;
    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
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
      include: { policies: true, documents: true },
    });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Error fetching customer", error: err.message });
  }
}

async function updateCustomer(req, res) {
  try {
    const { name, dob, phone, address, email } = req.body;
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        dob: dob ? new Date(dob) : undefined,
        phone,
        address,
        email,
      },
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

module.exports = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };