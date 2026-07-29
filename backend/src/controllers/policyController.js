const prisma = require("../config/db");

// Helper — get the Customer row linked to the logged-in user
async function getCustomerForUser(userId) {
  return prisma.customer.findUnique({ where: { userId } });
}

// CUSTOMER — apply for a policy plan (creates a PENDING application)
async function applyForPolicy(req, res) {
  try {
    const { planId } = req.body;

    const customer = await getCustomerForUser(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found for this account" });
    }

    const plan = await prisma.policyPlan.findUnique({ where: { id: Number(planId) } });
    if (!plan) return res.status(404).json({ message: "Policy plan not found" });

    const policy = await prisma.policy.create({
      data: {
        customerId: customer.id,
        planId: plan.id,
        premiumAmount: plan.premiumAmount,
        status: "PENDING",
      },
      include: { plan: true },
    });

    res.status(201).json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error applying for policy", error: err.message });
  }
}

// ADMIN/AGENT — create & directly activate a policy for a given customer
async function createPolicyForCustomer(req, res) {
  try {
    const { customerId, planId, premiumAmount } = req.body;

    const plan = await prisma.policyPlan.findUnique({ where: { id: Number(planId) } });
    if (!plan) return res.status(404).json({ message: "Policy plan not found" });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const policy = await prisma.policy.create({
      data: {
        customerId: Number(customerId),
        planId: plan.id,
        premiumAmount: premiumAmount ? Number(premiumAmount) : plan.premiumAmount,
        policyNumber: `POL-${Date.now()}`,
        startDate,
        endDate,
        status: "ACTIVE",
      },
      include: { plan: true, customer: true },
    });

    res.status(201).json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error creating policy", error: err.message });
  }
}

// Role-scoped list: ADMIN/AGENT see everything, CUSTOMER sees only their own
async function getPolicies(req, res) {
  try {
    const { status } = req.query;

    let where = status ? { status } : {};

    if (req.user.role === "CUSTOMER") {
      const customer = await getCustomerForUser(req.user.id);
      if (!customer) return res.json([]);
      where.customerId = customer.id;
    }

    const policies = await prisma.policy.findMany({
      where,
      include: { customer: true, plan: true },
      orderBy: { id: "desc" },
    });
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching policies", error: err.message });
  }
}

async function getPolicyById(req, res) {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true, plan: true, claims: true, payments: true },
    });
    if (!policy) return res.status(404).json({ message: "Policy not found" });

    if (req.user.role === "CUSTOMER") {
      const customer = await getCustomerForUser(req.user.id);
      if (!customer || policy.customerId !== customer.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error fetching policy", error: err.message });
  }
}

// ADMIN — approve or reject a pending application
async function updatePolicyStatus(req, res) {
  try {
    const { status } = req.body; // "ACTIVE" (approve) or "REJECTED"
    if (!["ACTIVE", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "status must be ACTIVE or REJECTED" });
    }

    const existing = await prisma.policy.findUnique({
      where: { id: Number(req.params.id) },
      include: { plan: true },
    });
    if (!existing) return res.status(404).json({ message: "Policy not found" });

    let data = { status };

    if (status === "ACTIVE") {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + existing.plan.durationMonths);
      data.policyNumber = `POL-${Date.now()}`;
      data.startDate = startDate;
      data.endDate = endDate;
    }

    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data,
      include: { customer: true, plan: true },
    });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error updating policy status", error: err.message });
  }
}

async function renewPolicy(req, res) {
  try {
    const existing = await prisma.policy.findUnique({
      where: { id: Number(req.params.id) },
      include: { plan: true },
    });
    if (!existing) return res.status(404).json({ message: "Policy not found" });

    const newEndDate = new Date(existing.endDate || new Date());
    newEndDate.setMonth(newEndDate.getMonth() + existing.plan.durationMonths);

    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: { endDate: newEndDate, status: "ACTIVE" },
    });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error renewing policy", error: err.message });
  }
}

async function cancelPolicy(req, res) {
  try {
    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: { status: "CANCELLED" },
    });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error cancelling policy", error: err.message });
  }
}

module.exports = {
  applyForPolicy,
  createPolicyForCustomer,
  getPolicies,
  getPolicyById,
  updatePolicyStatus,
  renewPolicy,
  cancelPolicy,
};