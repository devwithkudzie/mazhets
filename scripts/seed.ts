import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Use your service role key here (not the anon key)
const SUPABASE_URL = 'https://sodyadtrlbwfjaebncqf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZHlhZHRybGJ3ZmphZWJuY3FmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMxNjUyMSwiZXhwIjoyMDc0ODkyNTIxfQ.v5_VwYv0c18hAz0Dc0ZQ6jzb4oKabu_otokV4JRRPlc'; // Get from Supabase dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const categories = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Gaming'];
const locations = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo'];
const conditions = ['New', 'Used', 'Refurbished'];
const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Fiona', 'George', 'Hannah', 'Ian', 'Jane'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  try {
    // 1️⃣ Create Auth Users and Profiles
    const profiles = [];
    for (const name of names) {
      const email = `${name.toLowerCase()}@example.com`;
      const password = 'password123'; // simple password for demo

      // Create user in Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (userError) {
        console.error(`❌ Error creating user ${email}:`, userError);
        continue;
      }
      const userId = userData?.user?.id;
      if (!userId) {
        console.error(`❌ No user ID returned for ${email}`);
        continue;
      }

      profiles.push({
        id: userId,
        name,
        avatar_url: `https://i.pravatar.cc/150?u=${name}`,
      });
    }

    const { error: profilesError } = await supabase.from('profiles').insert(profiles);
    if (profilesError) {
      console.error('❌ Profiles insert error:', profilesError);
      return;
    }
    console.log('✅ Profiles inserted');

    // 2️⃣ Insert Listings
    const listings = [];
    for (let i = 0; i < 30; i++) {
      const user = profiles[randomInt(0, profiles.length - 1)];
      listings.push({
        id: uuidv4(),
        user_id: user.id,
        title: `${categories[randomInt(0, categories.length - 1)]} Item ${i + 1}`,
        price_cents: randomInt(5000, 200000),
        location: locations[randomInt(0, locations.length - 1)],
        category: categories[randomInt(0, categories.length - 1)],
        condition: conditions[randomInt(0, conditions.length - 1)],
        description: `Description for listing ${i + 1}`,
      });
    }

    const { data: insertedListings, error: listingsError } = await supabase.from('listings').insert(listings).select();
    if (listingsError) {
      console.error('❌ Listings insert error:', listingsError);
      return;
    }
    console.log('✅ Listings inserted');

    const listingsToUse = Array.isArray(insertedListings) && insertedListings.length > 0 ? insertedListings : listings;

    // 3️⃣ Insert Listing Images
    const listingImages = [];
    for (const listing of listingsToUse) {
      const imageCount = randomInt(1, 3);
      for (let i = 0; i < imageCount; i++) {
        listingImages.push({
          id: uuidv4(),
          listing_id: listing.id,
          url: `https://via.placeholder.com/300x300.png?text=Listing+${listing.title}+${i + 1}`,
          sort_index: i,
        });
      }
    }
    const { error: imagesError } = await supabase.from('listing_images').insert(listingImages);
    if (imagesError) {
      console.error('❌ Listing images insert error:', imagesError);
      return;
    }
    console.log('✅ Listing images inserted');

    // 4️⃣ Insert Saves
    const saves = [];
    for (const listing of listingsToUse) {
      const user = profiles[randomInt(0, profiles.length - 1)];
      if (user.id !== listing.user_id && Math.random() < 0.3) {
        saves.push({
          user_id: user.id,
          listing_id: listing.id,
        });
      }
    }
    if (saves.length > 0) {
      const { error: savesError } = await supabase.from('saves').insert(saves);
      if (savesError) {
        console.error('❌ Saves insert error:', savesError);
        return;
      }
      console.log('✅ Saves inserted');
    }

    // 5️⃣ Insert Message Threads & Messages
    const threads = [];
    const messages = [];
    for (let i = 0; i < 15; i++) {
      const buyer = profiles[randomInt(0, profiles.length - 1)];
      const listing = listingsToUse[randomInt(0, listingsToUse.length - 1)];
      if (buyer.id === listing.user_id) continue;

      const seller = profiles.find((p) => p.id === listing.user_id);

      const threadId = uuidv4();
      threads.push({
        id: threadId,
        listing_id: listing.id,
        buyer_id: buyer.id,
        seller_id: seller.id,
        last_text: 'Hello, is this still available?',
      });

      messages.push(
        {
          id: uuidv4(),
          thread_id: threadId,
          sender_id: buyer.id,
          text: 'Hello, is this still available?',
        },
        {
          id: uuidv4(),
          thread_id: threadId,
          sender_id: seller.id,
          text: 'Yes, it is available!',
        }
      );
    }

    if (threads.length > 0) {
      const { error: threadsError } = await supabase.from('message_threads').insert(threads);
      if (threadsError) {
        console.error('❌ Message threads insert error:', threadsError);
        return;
      }
      const { error: messagesError } = await supabase.from('messages').insert(messages);
      if (messagesError) {
        console.error('❌ Messages insert error:', messagesError);
        return;
      }
      console.log('✅ Message threads & messages inserted');
    }

    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seed();
