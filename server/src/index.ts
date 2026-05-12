import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/entries', async (_req, res) => {
  const entries = await prisma.coffeeEntry.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(entries);
});

app.post('/entries', async (req, res) => {
  const { roaster, coffee, brewMethod, amountMl, notes } = req.body;
  try {
    const entry = await prisma.coffeeEntry.create({
      data: {
        roaster: String(roaster ?? ''),
        coffee: String(coffee ?? ''),
        brewMethod: String(brewMethod ?? ''),
        amountMl: Number(amountMl ?? 0),
        notes: notes ? String(notes) : null,
      },
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Failed to create entry:', err);
    res.status(500).json({ error: 'Unable to create entry' });
  }
});

app.put('/entries/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { roaster, coffee, brewMethod, amountMl, notes } = req.body;
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const entry = await prisma.coffeeEntry.update({
      where: { id },
      data: {
        roaster: String(roaster ?? ''),
        coffee: String(coffee ?? ''),
        brewMethod: String(brewMethod ?? ''),
        amountMl: Number(amountMl ?? 0),
        notes: notes ? String(notes) : null,
      },
    });
    res.json(entry);
  } catch (err) {
    console.error('Failed to update entry:', err);
    res.status(500).json({ error: 'Unable to update entry' });
  }
});

app.delete('/entries/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    await prisma.coffeeEntry.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete entry:', err);
    res.status(500).json({ error: 'Unable to delete entry' });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});
