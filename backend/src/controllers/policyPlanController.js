const prisma = require("../config/db");

// ADMIN — create a new policy plan (e.g. "Family Health Shield")
async function createPlan(req, res) {
  try {
    const { name, category, description, premiumAmount, coverageAmount, durationMonths } = req.body;
    const plan = await prisma.policyPlan.create({
      data: {
        name,
        category,
        description,
        premiumAmount: Number(premiumAmount),
        coverageAmount: Number(coverageAmount),
        durationMonths: durationMonths ? Number(durationMonths) : 12,
      },
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: "Error creating plan", error: err.message });
  }
}

// Any logged-in user (Admin manages, Customer browses to apply)
async function getPlans(req, res) {
  try {
    const { category } = req.query;
    const plans = await prisma.policyPlan.findMany({
      where: category ? { category } : undefined,
      orderBy: { id: "desc" },
    });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Error fetching plans", error: err.message });
  }
}

async function updatePlan(req, res) {
  try {
    const { name, category, description, premiumAmount, coverageAmount, durationMonths } = req.body;
    const plan = await prisma.policyPlan.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        category,
        description,
        premiumAmount: premiumAmount ? Number(premiumAmount) : undefined,
        coverageAmount: coverageAmount ? Number(coverageAmount) : undefined,
        durationMonths: durationMonths ? Number(durationMonths) : undefined,
      },
    });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: "Error updating plan", error: err.message });
  }
}

async function deletePlan(req, res) {
  try {
    await prisma.policyPlan.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting plan", error: err.message });
  }
}

module.exports = { createPlan, getPlans, updatePlan, deletePlan };