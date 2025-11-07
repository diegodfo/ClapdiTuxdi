import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use("*", cors());
app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Webhook URL de Make (configurable via env variable)
const MAKE_WEBHOOK_URL = Deno.env.get('MAKE_WEBHOOK_URL') || '';

// Initialize with sample data if empty
async function initializeSampleData() {
  const personIds = await kv.get('personIds');
  
  if (!personIds) {
    const samplePeople = [
      {
        id: '1',
        name: 'María García',
        position: 'Diseñadora UX',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        applauseCount: 8,
        foodBrought: 2,
        pendingFood: false,
        lastApplause: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        position: 'Desarrollador Frontend',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        applauseCount: 12,
        foodBrought: 1,
        pendingFood: false,
        lastApplause: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Ana Martínez',
        position: 'Product Manager',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        applauseCount: 3,
        foodBrought: 0,
        pendingFood: false,
        lastApplause: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Luis Fernández',
        position: 'Desarrollador Backend',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        applauseCount: 14,
        foodBrought: 3,
        pendingFood: false,
        lastApplause: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Sofia López',
        position: 'QA Engineer',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        applauseCount: 5,
        foodBrought: 0,
        pendingFood: true,
        lastApplause: new Date().toISOString(),
      },
    ];

    const ids = samplePeople.map(p => p.id);
    await kv.set('personIds', ids);
    
    for (const person of samplePeople) {
      await kv.set(`person:${person.id}`, person);
    }
    
    console.log('Sample data initialized');
  }
}

// Send data to Make webhook
async function sendToMakeWebhook(data: any) {
  if (!MAKE_WEBHOOK_URL) {
    console.log('Make webhook URL not configured, skipping');
    return;
  }
  
  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`Error sending to Make webhook: ${response.status} ${response.statusText}`);
    } else {
      console.log('Data sent to Make webhook successfully');
    }
  } catch (error) {
    console.error(`Error calling Make webhook: ${error}`);
  }
}

// Get all people
app.get('/make-server-daca5355/people', async (c) => {
  try {
    await initializeSampleData();
    
    const personIds = await kv.get('personIds') as string[] || [];
    const people = await kv.mget(personIds.map(id => `person:${id}`));
    
    return c.json({ people: people.filter(Boolean) });
  } catch (error) {
    console.error(`Error getting people: ${error}`);
    return c.json({ error: 'Failed to get people' }, 500);
  }
});

// Get person by ID
app.get('/make-server-daca5355/people/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const person = await kv.get(`person:${id}`);
    
    if (!person) {
      return c.json({ error: 'Person not found' }, 404);
    }
    
    return c.json({ person });
  } catch (error) {
    console.error(`Error getting person ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Failed to get person' }, 500);
  }
});

// Get history for a person
app.get('/make-server-daca5355/people/:id/history', async (c) => {
  try {
    const personId = c.req.param('id');
    const allHistory = await kv.getByPrefix('history:');
    
    // Filter history for this person and sort by date
    const personHistory = allHistory
      .filter((h: any) => h?.to === personId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20); // Last 20 entries
    
    return c.json({ history: personHistory });
  } catch (error) {
    console.error(`Error getting history for person ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Failed to get history' }, 500);
  }
});

// Give applause
app.post('/make-server-daca5355/applause', async (c) => {
  try {
    const { personId, givenBy } = await c.req.json();
    
    if (!personId || !givenBy) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const person = await kv.get(`person:${personId}`) as any;
    
    if (!person) {
      return c.json({ error: 'Person not found' }, 404);
    }
    
    // Update applause count
    person.applauseCount += 1;
    person.lastApplause = new Date().toISOString();
    
    let celebration = false;
    
    // Check if reached 15 applause
    if (person.applauseCount >= 15) {
      person.applauseCount = 0;
      person.foodBrought += 1;
      person.pendingFood = true;
      celebration = true;
    }
    
    await kv.set(`person:${personId}`, person);
    
    // Save to history
    const historyEntry = {
      date: new Date().toISOString(),
      from: givenBy,
      to: personId,
      toName: person.name,
      action: '+1',
    };
    
    const historyKey = `history:${Date.now()}-${Math.random()}`;
    await kv.set(historyKey, historyEntry);
    
    // Send to Make webhook
    await sendToMakeWebhook({
      type: 'applause',
      person: person,
      givenBy: givenBy,
      celebration: celebration,
      history: historyEntry,
    });
    
    return c.json({ person, celebration });
  } catch (error) {
    console.error(`Error giving applause: ${error}`);
    return c.json({ error: 'Failed to give applause' }, 500);
  }
});

// Remove applause
app.post('/make-server-daca5355/remove-applause', async (c) => {
  try {
    const { personId, removedBy } = await c.req.json();
    
    if (!personId || !removedBy) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const person = await kv.get(`person:${personId}`) as any;
    
    if (!person) {
      return c.json({ error: 'Person not found' }, 404);
    }
    
    // Only remove if count > 0
    if (person.applauseCount > 0) {
      person.applauseCount -= 1;
      person.lastApplause = new Date().toISOString();
      
      await kv.set(`person:${personId}`, person);
      
      // Save to history
      const historyEntry = {
        date: new Date().toISOString(),
        from: removedBy,
        to: personId,
        toName: person.name,
        action: '-1',
      };
      
      const historyKey = `history:${Date.now()}-${Math.random()}`;
      await kv.set(historyKey, historyEntry);
      
      // Send to Make webhook
      await sendToMakeWebhook({
        type: 'remove_applause',
        person: person,
        removedBy: removedBy,
        history: historyEntry,
      });
    }
    
    return c.json({ person });
  } catch (error) {
    console.error(`Error removing applause: ${error}`);
    return c.json({ error: 'Failed to remove applause' }, 500);
  }
});

// Mark food as brought
app.post('/make-server-daca5355/mark-food-brought/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const person = await kv.get(`person:${id}`) as any;
    
    if (!person) {
      return c.json({ error: 'Person not found' }, 404);
    }
    
    person.pendingFood = false;
    await kv.set(`person:${id}`, person);
    
    // Send to Make webhook
    await sendToMakeWebhook({
      type: 'food_brought',
      person: person,
    });
    
    return c.json({ person });
  } catch (error) {
    console.error(`Error marking food as brought: ${error}`);
    return c.json({ error: 'Failed to mark food as brought' }, 500);
  }
});

Deno.serve(app.fetch);
