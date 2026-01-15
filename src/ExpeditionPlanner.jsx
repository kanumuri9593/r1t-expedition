import React, { useState, useEffect } from 'react';

const ExpeditionPlanner = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [completedItems, setCompletedItems] = useState({});
  const [completedCheckpoints, setCompletedCheckpoints] = useState({});
  const [selectedCampsite, setSelectedCampsite] = useState({});
  const [showCampsiteModal, setShowCampsiteModal] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCampsiteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCampsiteModal]);

  const toggleItem = (category, item) => {
    const key = `${category}-${item}`;
    setCompletedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCheckpoint = (dayNum, checkpointId) => {
    const key = `day${dayNum}-${checkpointId}`;
    setCompletedCheckpoints(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isCompleted = (category, item) => completedItems[`${category}-${item}`];
  const isCheckpointDone = (dayNum, checkpointId) => completedCheckpoints[`day${dayNum}-${checkpointId}`];

  const checklistCategories = [
    {
      id: 'permits',
      title: 'Permits & Reservations',
      icon: '📋',
      gradient: 'from-amber-500 to-orange-600',
      items: [
        { name: 'Cape Hatteras ORV Permit', details: '$50 for 10 days • recreation.gov', critical: true },
        { name: 'Cape Lookout ORV Permit', details: '$75 • Required for South Core Banks', critical: true },
        { name: 'Vehicle Ferry Reservation', details: 'Cape Lookout Cabins & Camps • (252) 729-9751', critical: true },
        { name: 'Day 1 Campsite Reserved', details: 'Gooney Creek or alternate', critical: true },
        { name: 'Day 2 Campsite Reserved', details: 'Oregon Inlet or alternate', critical: true },
        { name: 'Day 4 Lodging Booked', details: 'Mount Airy area', critical: false },
      ]
    },
    {
      id: 'recovery',
      title: 'Recovery Gear',
      icon: '🔧',
      gradient: 'from-red-500 to-rose-600',
      items: [
        { name: 'Traction Boards (2-4)', details: 'With mounting straps', critical: true },
        { name: 'Folding Shovel', details: 'For sand extraction', critical: true },
        { name: 'Tow Strap 20ft', details: '20,000 lb capacity', critical: true },
        { name: 'D-Ring Shackles (2)', details: 'For recovery points', critical: true },
        { name: 'Tire Deflators', details: 'Staun-style recommended', critical: true },
        { name: 'Tire Pressure Gauge', details: 'Digital preferred', critical: true },
      ]
    },
    {
      id: 'camping',
      title: 'Camping Essentials',
      icon: '⛺',
      gradient: 'from-emerald-500 to-teal-600',
      items: [
        { name: 'R1T Tent Setup', details: 'Bed-mounted tent system', critical: true },
        { name: 'Sleeping Bag (15°F)', details: 'Cold-rated for January', critical: true },
        { name: 'Sleeping Pad (R-5+)', details: 'Insulated for cold ground', critical: true },
        { name: 'Water (4+ gallons)', details: 'No services on Cape Lookout', critical: true },
        { name: 'Food (48+ hours)', details: 'Self-sufficient on island', critical: true },
        { name: 'Camp Stove + Fuel', details: 'For hot meals', critical: false },
      ]
    },
    {
      id: 'documents',
      title: 'Documents & Tech',
      icon: '📱',
      gradient: 'from-blue-500 to-indigo-600',
      items: [
        { name: 'NACS Adapter', details: 'For Tesla Superchargers!', critical: true },
        { name: 'Offline Maps Downloaded', details: 'Spotty cell on islands', critical: true },
        { name: 'Driver License', details: 'Valid ID required', critical: true },
        { name: 'Vehicle Registration', details: 'Keep in vehicle', critical: true },
        { name: 'Insurance Card', details: 'Physical copy', critical: true },
        { name: 'Tesla App Installed', details: 'Backup payment option', critical: false },
      ]
    }
  ];

  const campsiteOptions = {
    day1: [
      {
        name: 'Gooney Creek Campgrounds',
        location: 'Front Royal, VA',
        elevation: '950 ft',
        vibe: 'Mountain Stream Paradise',
        description: 'Nestled in the Blue Ridge foothills with a babbling creek. Wake to misty mountain mornings with deer grazing nearby. Perfect R1T tent spot overlooking the water.',
        features: ['Creek-side sites', 'Mountain views', 'Wildlife viewing', 'Dark skies'],
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        rating: 4.8,
        price: '$35/night'
      },
      {
        name: 'Shenandoah River State Park',
        location: 'Bentonville, VA',
        elevation: '1,100 ft',
        vibe: 'River Valley Majesty',
        description: 'Dramatic bluffs over the Shenandoah River. Watch eagles soar at sunset from your elevated campsite. The R1T fits perfectly at riverside spots.',
        features: ['River bluffs', 'Eagle habitat', 'Sunrise views', 'Hiking trails'],
        image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800',
        rating: 4.9,
        price: '$40/night'
      },
      {
        name: 'Sky Meadows State Park',
        location: 'Delaplane, VA',
        elevation: '1,800 ft',
        vibe: 'High Meadow Serenity',
        description: 'Sleep among the clouds at this high-elevation meadow. 360° Blue Ridge panoramas. Wild horses sometimes wander through. Absolutely magical.',
        features: ['Highest elevation', '360° views', 'Wild horses', 'Star gazing'],
        image: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800',
        rating: 4.7,
        price: '$45/night'
      }
    ],
    day2: [
      {
        name: 'Oregon Inlet Campground',
        location: 'Nags Head, NC',
        elevation: 'Sea Level',
        vibe: 'Oceanfront Wild',
        description: 'Fall asleep to crashing waves on pristine Outer Banks beach. Wake to dolphins playing in the surf. Your R1T becomes a beachfront suite.',
        features: ['Oceanfront', 'Dolphins', 'Beach access', 'Sunrise over Atlantic'],
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        rating: 4.6,
        price: '$28/night'
      },
      {
        name: 'Cape Point Campground',
        location: 'Buxton, NC',
        elevation: 'Sea Level',
        vibe: 'Lighthouse Dreams',
        description: 'Camp in the shadow of the legendary Cape Hatteras Lighthouse. The most iconic camping spot on the East Coast. Spectacular sunrise guaranteed.',
        features: ['Lighthouse views', 'Historic site', 'Best fishing', 'Wild beauty'],
        image: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=800',
        rating: 4.8,
        price: '$28/night'
      },
      {
        name: 'Frisco Campground',
        location: 'Frisco, NC',
        elevation: 'Sea Level',
        vibe: 'Dune Sanctuary',
        description: 'Sheltered among ancient dunes with maritime forest backdrop. Protected from wind yet steps from beach. The most serene Outer Banks experience.',
        features: ['Dune protected', 'Maritime forest', 'Wildlife haven', 'Peaceful'],
        image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
        rating: 4.7,
        price: '$28/night'
      }
    ],
    day3: [
      {
        name: 'South Core Banks - Lighthouse',
        location: 'Cape Lookout, NC',
        elevation: 'Sea Level',
        vibe: 'Ultimate Solitude',
        description: 'Camp beneath the diamond-patterned lighthouse on a ROADLESS barrier island. No electricity. No services. Just you, wild horses, and infinite stars.',
        features: ['Iconic lighthouse', 'Wild horses', 'Zero light pollution', 'Complete solitude'],
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
        rating: 5.0,
        price: 'FREE (ferry $135-175)'
      },
      {
        name: 'South Core Banks - Power Squadron',
        location: 'Cape Lookout, NC',
        elevation: 'Sea Level',
        vibe: 'Beach Wilderness',
        description: 'The widest beach section with massive dunes. Watch dolphins hunt at dawn. Wild horses roam past your R1T. This is bucket-list camping.',
        features: ['Widest beach', 'Dolphin sightings', 'Massive dunes', 'Horse encounters'],
        image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
        rating: 4.9,
        price: 'FREE (ferry $135-175)'
      },
      {
        name: 'South Core Banks - Great Island',
        location: 'Cape Lookout, NC',
        elevation: 'Sea Level',
        vibe: 'Sunset Paradise',
        description: 'West-facing beach for spectacular sunsets over the sound. Calmer waters. Best shelling on the island. Pure magic.',
        features: ['Sunset views', 'Calm waters', 'Best shelling', 'Sound-side beauty'],
        image: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800',
        rating: 4.8,
        price: 'FREE (ferry $135-175)'
      }
    ]
  };

  const dayItineraries = [
    {
      num: 1,
      title: 'Blue Ridge Descent',
      date: 'Saturday, January 17',
      miles: 280,
      route: 'Jersey City → Front Royal, VA',
      weather: '42°/28°F • Partly Cloudy',
      highlight: 'Skyline Drive',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      checkpoints: [
        { id: 'dep1', time: '06:30', title: 'Depart Jersey City', type: 'start', icon: '🚀', description: 'Battery preconditioned overnight. Start with 100% charge.', mustVisit: true },
        { id: 'charge1', time: '08:45', title: 'Tesla Supercharger - Manassas', type: 'charging', icon: '⚡', description: 'Wawa location • 8 stalls • 250kW • OFF-PEAK before 9AM = $0.29/kWh!', mustVisit: true, savings: 'Save ~$15 vs peak!' },
        { id: 'call1', time: '10:00', title: 'Skyline Drive Status Check', type: 'call', icon: '📞', description: 'Call (540) 999-3500 to confirm road is open. Winter closures common!', mustVisit: true },
        { id: 'enter1', time: '10:30', title: 'Enter Shenandoah - Thornton Gap', type: 'scenic', icon: '🏔️', description: 'US-211 entrance. 105 miles of Blue Ridge beauty ahead. 75+ overlooks!', mustVisit: true },
        { id: 'view1', time: '11:30', title: 'Stony Man Overlook', type: 'viewpoint', icon: '📸', description: 'Mile 38.6 - Second highest peak in the park. Stunning valley views!', mustVisit: true },
        { id: 'lunch1', time: '12:30', title: 'Big Meadows Lodge', type: 'food', icon: '🍽️', description: 'Historic lodge with panoramic views. Try the blackberry ice cream!', mustVisit: false },
        { id: 'view2', time: '14:00', title: 'Dark Hollow Falls', type: 'hike', icon: '🥾', description: '1.4 mile round trip to a 70-foot waterfall. Easy trail.', mustVisit: false },
        { id: 'exit1', time: '15:00', title: 'Exit at Swift Run Gap', type: 'milestone', icon: '🛣️', description: 'Take US-33 West. Regen braking recovers significant range on descent!', mustVisit: true },
        { id: 'camp1', time: '17:00', title: 'Arrive Camp', type: 'camp', icon: '⛺', description: 'Set up R1T tent, enjoy mountain sunset. You made it!', mustVisit: true }
      ],
      alerts: ['WINTER CLOSURE RISK: Always call ahead!', 'BACKUP: US-29 through Charlottesville + Luray Caverns'],
      tips: ['No DCFC on Skyline - start 100%', '35 mph limit - plan 3+ hours', 'Download offline maps']
    },
    {
      num: 2,
      title: 'Outer Banks Rush',
      date: 'Sunday, January 18',
      miles: 320,
      route: 'Front Royal → Nags Head, NC',
      weather: '52°/38°F • Mostly Sunny',
      highlight: 'Beach Driving',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      checkpoints: [
        { id: 'dep2', time: '05:30', title: 'Early Departure', type: 'start', icon: '🌅', description: 'Leave early to hit Supercharger during off-peak! Longest day ahead.', mustVisit: true },
        { id: 'charge2', time: '08:00', title: 'Tesla Supercharger - Virginia Beach', type: 'charging', icon: '⚡', description: '8 stalls • 250kW • OFF-PEAK 4AM-8AM = $0.23/kWh! BEST RATE!', mustVisit: true, savings: 'Save ~$20 vs peak!' },
        { id: 'bridge2', time: '09:00', title: 'Hampton Roads Bridge-Tunnel', type: 'scenic', icon: '🌊', description: '3.5 mile engineering marvel. Views of naval ships and Chesapeake Bay.', mustVisit: true },
        { id: 'enter2', time: '11:30', title: 'Cross Wright Memorial Bridge', type: 'milestone', icon: '🏝️', description: 'Welcome to the Outer Banks! Barrier island adventure begins.', mustVisit: true },
        { id: 'stop2', time: '12:00', title: 'Bodie Island Lighthouse', type: 'photo', icon: '📸', description: 'Classic black & white striped lighthouse. Quick photo stop!', mustVisit: true },
        { id: 'lunch2', time: '12:30', title: 'Kill Devil Grill', type: 'food', icon: '🍔', description: 'Local favorite! Try the Outer Banks fish tacos.', mustVisit: false },
        { id: 'air2', time: '13:30', title: 'Air Down Tires - ORV Ramp 4', type: 'prep', icon: '🔧', description: 'Drop to 20 PSI. Use Soft Sand Mode. Air down BEFORE beach!', mustVisit: true },
        { id: 'beach2', time: '14:00', title: 'Beach Driving - Cape Hatteras', type: 'adventure', icon: '🏖️', description: '20 miles of pristine beach driving. Watch for wildlife!', mustVisit: true },
        { id: 'lighthouse2', time: '15:30', title: 'Cape Hatteras Lighthouse', type: 'landmark', icon: '🗼', description: 'Americas tallest brick lighthouse. 257 steps to the top!', mustVisit: true },
        { id: 'camp2', time: '17:00', title: 'Oregon Inlet Campground', type: 'camp', icon: '⛺', description: 'Oceanfront camping! Set up with Atlantic sunset.', mustVisit: true }
      ],
      alerts: ['ORV PERMIT REQUIRED: $50 at recreation.gov', 'Check tide times before beach driving'],
      tips: ['Beach PSI: 20 for sand, 15 if stuck', 'Soft Sand Mode is your friend', 'Rinse undercarriage at camp']
    },
    {
      num: 3,
      title: 'The Crown Experience',
      date: 'Monday, January 19',
      miles: 90,
      route: 'Ferry to Cape Lookout',
      weather: '55°/40°F • Partly Cloudy',
      highlight: 'Barrier Island Paradise',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
      checkpoints: [
        { id: 'pack3', time: '06:00', title: 'Pack Camp Thoroughly', type: 'prep', icon: '📦', description: 'No services on island! Ensure 80%+ battery. Pack all water/food for 36+ hrs.', mustVisit: true },
        { id: 'dep3', time: '07:30', title: 'Depart for Davis', type: 'start', icon: '🚗', description: 'Drive south on NC-12, then west to ferry terminal.', mustVisit: true },
        { id: 'ferry3', time: '09:30', title: 'Arrive Ferry Terminal', type: 'milestone', icon: '⛴️', description: 'Cape Lookout Cabins & Camps, Davis NC. Arrive 45 min early!', mustVisit: true },
        { id: 'board3', time: '10:00', title: 'Board Miss Tempie/Miss Brenda', type: 'adventure', icon: '🚢', description: '45-minute crossing to paradise. Vehicle ferry $135-175.', mustVisit: true },
        { id: 'arrive3', time: '10:45', title: 'Arrive Cape Lookout!', type: 'landmark', icon: '🏝️', description: 'Welcome to the ROADLESS barrier island. Check in at NPS office.', mustVisit: true },
        { id: 'air3', time: '11:00', title: 'Air Down Immediately', type: 'prep', icon: '🔧', description: 'Drop to 18-20 PSI right after ferry. All driving is soft sand!', mustVisit: true },
        { id: 'light3', time: '12:00', title: 'Cape Lookout Lighthouse', type: 'landmark', icon: '💎', description: 'The iconic diamond-patterned lighthouse. Best photos at golden hour!', mustVisit: true },
        { id: 'explore3', time: '13:00', title: 'Explore the Island', type: 'adventure', icon: '🐎', description: 'Wild horses roam free. Dolphins offshore. Shell hunting paradise.', mustVisit: true },
        { id: 'camp3', time: '15:00', title: 'Set Primitive Camp', type: 'camp', icon: '⛺', description: 'Above high tide, below dunes. The most incredible camping of your life.', mustVisit: true },
        { id: 'sunset3', time: '17:30', title: 'Sunset & Stargazing', type: 'experience', icon: '🌌', description: 'Zero light pollution. Milky Way visible. Pure magic.', mustVisit: true }
      ],
      alerts: ['NO CHARGING ON ISLAND - arrive 80%+!', 'FERRY MAY CANCEL - call morning of: (252) 729-9751', 'SELF-SUFFICIENT: All water/food for 36+ hours'],
      tips: ['Camp Mode uses ~1%/hr', 'Fires only below high tide line', 'Pack out EVERYTHING']
    },
    {
      num: 4,
      title: 'Contrast Therapy',
      date: 'Tuesday, January 20',
      miles: 280,
      route: 'Cape Lookout → Mount Airy, NC',
      weather: '48°/32°F • Clear',
      highlight: 'Pilot Mountain Summit',
      image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
      checkpoints: [
        { id: 'pack4', time: '05:30', title: 'Pack Camp - Leave No Trace', type: 'prep', icon: '🧹', description: 'Pack everything out. Leave the island pristine.', mustVisit: true },
        { id: 'drive4', time: '06:30', title: 'Drive to Great Island Dock', type: 'start', icon: '🚗', description: 'Return to ferry departure point.', mustVisit: true },
        { id: 'ferry4', time: '07:30', title: 'Board Return Ferry', type: 'milestone', icon: '⛴️', description: 'First ferry of the day. Goodbye paradise!', mustVisit: true },
        { id: 'air4', time: '08:15', title: 'Air Up at Davis', type: 'prep', icon: '🔧', description: 'Back to 42 PSI for highway driving.', mustVisit: true },
        { id: 'charge4a', time: '08:30', title: 'Tesla Supercharger - Morehead City', type: 'charging', icon: '⚡', description: '12 stalls • V4 325kW! Fastest charging of the trip!', mustVisit: true, savings: 'V4 = 15 min to 80%!' },
        { id: 'drive4b', time: '10:30', title: 'Drive to Pilot Mountain', type: 'scenic', icon: '🛣️', description: 'Head northwest through NC Piedmont. Beautiful rural scenery.', mustVisit: true },
        { id: 'pilot4', time: '13:00', title: 'Pilot Mountain State Park', type: 'hike', icon: '🥾', description: '1.6 mile summit hike. 360° views of the Piedmont. Iconic knob!', mustVisit: true },
        { id: 'view4', time: '14:00', title: 'Big Pinnacle Overlook', type: 'viewpoint', icon: '📸', description: 'The money shot! Dramatic quartzite dome rising 1,400 feet.', mustVisit: true },
        { id: 'charge4b', time: '14:30', title: 'Tesla Supercharger - Winston-Salem', type: 'charging', icon: '⚡', description: 'Quick top-up if needed. 12 stalls • 250kW.', mustVisit: false },
        { id: 'arrive4', time: '16:00', title: 'Arrive Mount Airy', type: 'milestone', icon: '🏘️', description: 'The town that inspired Mayberry! Andy Griffith hometown.', mustVisit: true },
        { id: 'dinner4', time: '17:00', title: 'Snappy Lunch', type: 'food', icon: '🍽️', description: 'Famous pork chop sandwich since 1923. A MUST!', mustVisit: true },
        { id: 'floyd4', time: '18:00', title: 'Floyds Barber Shop', type: 'landmark', icon: '💈', description: 'The original shop from Andy Griffith Show. Photo op!', mustVisit: false }
      ],
      alerts: ['CONFIRM FERRY: Call by 9 AM - (252) 729-9751', 'Air up before highway!'],
      tips: ['Pilot Mountain: moderate 1.6 mi hike', 'Snappy Lunch closes early!', 'Hotel = hot shower heaven']
    },
    {
      num: 5,
      title: 'Controlled Glide Home',
      date: 'Wednesday, January 21',
      miles: 420,
      route: 'Mount Airy → Jersey City',
      weather: '45°/30°F • Clear',
      highlight: 'Mission Complete',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      checkpoints: [
        { id: 'dep5', time: '05:00', title: 'Ultra Early Departure', type: 'start', icon: '🌙', description: 'Leave in darkness to hit BOTH chargers at off-peak rates!', mustVisit: true },
        { id: 'drive5a', time: '05:30', title: 'I-77 North to I-81', type: 'scenic', icon: '🛣️', description: 'Beautiful mountain highway. Driver+ ready for the long haul.', mustVisit: true },
        { id: 'charge5a', time: '07:30', title: 'Tesla Supercharger - Wytheville', type: 'charging', icon: '⚡', description: '6 stalls • 150kW • OFF-PEAK = $0.33/kWh with Tesla Sub!', mustVisit: true, savings: 'Save ~$10 vs peak!' },
        { id: 'breakfast5', time: '08:00', title: 'Waffle House Breakfast', type: 'food', icon: '🧇', description: 'Classic road trip fuel. Right next to Supercharger!', mustVisit: false },
        { id: 'drive5b', time: '08:30', title: 'I-81 Scenic Corridor', type: 'scenic', icon: '🏔️', description: 'Shenandoah Valley views. Rolling hills and farmland.', mustVisit: true },
        { id: 'charge5b', time: '11:00', title: 'Tesla Supercharger - Harrisburg', type: 'charging', icon: '⚡', description: '12 stalls • V4 325kW! • OFF-PEAK before 9AM = $0.27/kWh!', mustVisit: true, savings: 'V4 = 15 min charge!' },
        { id: 'lunch5', time: '12:00', title: 'Lunch Break - Harrisburg', type: 'food', icon: '🍕', description: 'Stretch your legs. Final meal on the road.', mustVisit: false },
        { id: 'drive5c', time: '12:30', title: 'I-78 Final Push', type: 'milestone', icon: '🏁', description: 'Last leg home. 2.5 hours to Jersey City!', mustVisit: true },
        { id: 'home5', time: '15:00', title: 'ARRIVE HOME!', type: 'finish', icon: '🏠', description: '1,400+ miles complete! Park the R1T. You did it!', mustVisit: true },
        { id: 'clean5', time: '16:00', title: 'Clean Salt & Sand', type: 'maintenance', icon: '🧽', description: 'Rinse undercarriage within 48 hours. Protect your R1T!', mustVisit: true }
      ],
      alerts: ['Keep speed 65-70 mph for optimal range', 'Clean undercarriage within days!'],
      tips: ['Precondition 30 min before each stop', 'Driver+ is your friend on I-81', 'Charge to 80% in Harrisburg - enough for home']
    }
  ];

  const emergencyContacts = [
    { name: 'Skyline Drive Status', phone: '(540) 999-3500', note: 'Press 1, then 1' },
    { name: 'Cape Lookout Ferry', phone: '(252) 729-9751', note: 'Vehicle reservations' },
    { name: 'Rivian Roadside', phone: '(888) 748-4261', note: '24/7 support' },
    { name: 'Coast Guard Oregon Inlet', phone: '(252) 986-2175', note: 'Marine emergencies' },
  ];

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalItems = checklistCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const progress = Math.round((completedCount / totalItems) * 100);

  const getCheckpointColor = (type) => {
    const colors = {
      start: 'from-emerald-400 to-emerald-600',
      charging: 'from-amber-400 to-yellow-500',
      scenic: 'from-blue-400 to-blue-600',
      viewpoint: 'from-purple-400 to-purple-600',
      photo: 'from-pink-400 to-pink-600',
      food: 'from-orange-400 to-orange-600',
      hike: 'from-green-400 to-green-600',
      milestone: 'from-cyan-400 to-cyan-600',
      camp: 'from-indigo-400 to-indigo-600',
      landmark: 'from-rose-400 to-rose-600',
      adventure: 'from-teal-400 to-teal-600',
      prep: 'from-slate-400 to-slate-600',
      call: 'from-red-400 to-red-600',
      experience: 'from-violet-400 to-violet-600',
      finish: 'from-amber-500 to-orange-600',
      maintenance: 'from-gray-400 to-gray-600'
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  const CampsiteModal = ({ dayKey, onClose }) => {
    const options = campsiteOptions[dayKey];
    if (!options) return null;

    return (
      <div 
        className="fixed inset-0 z-50 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Container - centered */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl w-full max-w-5xl border border-amber-500/20 shadow-2xl shadow-amber-500/10 pointer-events-auto"
            style={{ maxHeight: 'calc(100vh - 40px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-20"
            >
              ✕
            </button>
            
            {/* Fixed Header */}
            <div className="p-6 pb-4 border-b border-white/10">
              <h3 className="text-3xl font-light text-white pr-12" style={{ fontFamily: 'Playfair Display, serif' }}>
                Select Your Campsite
              </h3>
              <p className="text-amber-400/80 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Day {dayKey.replace('day', '')} • Choose your adventure
              </p>
            </div>

            {/* Scrollable Content */}
            <div 
              className="p-6 pt-4 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <div className="space-y-6">
                {options.map((site, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedCampsite(prev => ({ ...prev, [dayKey]: site.name }));
                      onClose();
                    }}
                    className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                      selectedCampsite[dayKey] === site.name 
                        ? 'border-amber-400 shadow-lg shadow-amber-500/20' 
                        : 'border-transparent hover:border-amber-400/50'
                    }`}
                    style={{ background: 'rgba(30, 41, 59, 0.8)' }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section */}
                      <div className="md:w-2/5 h-48 md:h-56 relative overflow-hidden flex-shrink-0">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${site.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-800/90 hidden md:block" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-800/90 md:hidden" />
                        
                        {/* Elevation Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
                          <span className="text-amber-400 text-sm font-medium">⛰️ {site.elevation}</span>
                        </div>
                        
                        {/* Selected Check */}
                        {selectedCampsite[dayKey] === site.name && (
                          <div className="absolute top-4 right-4 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-slate-900 text-xl font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <div className="md:w-3/5 p-5 md:p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-xl text-white font-semibold">{site.name}</h4>
                            <p className="text-white/50 text-sm">{site.location}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="flex items-center gap-1 text-amber-400 mb-1">
                              <span>★</span>
                              <span className="text-white font-medium">{site.rating}</span>
                            </div>
                            <p className="text-emerald-400 text-sm font-semibold">{site.price}</p>
                          </div>
                        </div>
                        
                        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {site.vibe}
                        </p>
                        
                        <p className="text-white/70 text-sm mb-4 leading-relaxed">
                          {site.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {site.features.map((feature, fidx) => (
                            <span 
                              key={fidx}
                              className="px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-xs border border-white/10"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        {/* Select Button */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className={`text-center py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                            selectedCampsite[dayKey] === site.name
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-white/10 text-white/70 group-hover:bg-amber-500/20 group-hover:text-amber-400'
                          }`}>
                            {selectedCampsite[dayKey] === site.name ? '✓ Selected' : 'Tap to Select'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom padding for scroll */}
              <div className="h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        
        .progress-ring {
          transform: rotate(-90deg);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .timeline-line {
          background: linear-gradient(180deg, rgba(251,191,36,0.8) 0%, rgba(251,191,36,0.2) 100%);
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(251,191,36,0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(251,191,36,0.5);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'saturate(0.3)',
              transform: `translateY(${scrollY * 0.3}px)`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 noise-overlay pointer-events-none" />
        </div>
        
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-amber-400/80 tracking-[0.3em] uppercase text-sm mb-6" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              January 17-21, 2026
            </p>
          </div>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 animate-slide-up"
            style={{ fontFamily: 'Playfair Display, serif', animationDelay: '0.2s' }}
          >
            <span className="text-white">R1T</span>
            <span className="text-gradient"> Southern</span>
            <br />
            <span className="text-white/90">Coast</span>
            <span className="text-gradient"> Expedition</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>1,400+</p>
              <p className="text-white/40 text-sm tracking-wider uppercase">Miles</p>
            </div>
            <div className="w-px bg-white/10 hidden md:block" />
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>5</p>
              <p className="text-white/40 text-sm tracking-wider uppercase">Days</p>
            </div>
            <div className="w-px bg-white/10 hidden md:block" />
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>3</p>
              <p className="text-white/40 text-sm tracking-wider uppercase">States</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 text-sm animate-slide-up" style={{ fontFamily: 'JetBrains Mono, monospace', animationDelay: '0.4s' }}>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Skyline Drive</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Outer Banks</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Cape Lookout</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Wild Horses</span>
          </div>
          
          <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="inline-flex flex-col items-center glass-card rounded-3xl p-6">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#progressGradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${progress * 2.83} 283`} className="transition-all duration-700" />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{progress}%</span>
                </div>
              </div>
              <p className="text-white/60 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {completedCount}/{totalItems} checklist ready
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Checklist Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400/80 tracking-[0.3em] uppercase text-sm mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Pre-Flight Checklist
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Everything You Need
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {checklistCategories.map((category, cidx) => (
              <div key={category.id} className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-amber-500/20">
                <div className={`h-1.5 bg-gradient-to-r ${category.gradient}`} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{category.icon}</span>
                    <h3 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {category.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {category.items.map((item, iidx) => (
                      <button
                        key={iidx}
                        onClick={() => toggleItem(category.id, item.name)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-300 text-left ${
                          isCompleted(category.id, item.name)
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                          isCompleted(category.id, item.name) ? 'bg-emerald-500 text-white' : 'bg-white/10 border border-white/20'
                        }`}>
                          {isCompleted(category.id, item.name) && <span className="text-xs">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-medium text-sm transition-all duration-300 ${
                              isCompleted(category.id, item.name) ? 'text-emerald-400 line-through' : 'text-white'
                            }`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                              {item.name}
                            </p>
                            {item.critical && !isCompleted(category.id, item.name) && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Critical</span>
                            )}
                          </div>
                          <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {item.details}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campsite Selection Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400/80 tracking-[0.3em] uppercase text-sm mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Your Adventure Awaits
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Choose Your <span className="text-gradient">Campsites</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-sm">
              Three nights of breathtaking views from your R1T tent. Tap to explore options.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5">
            {['day1', 'day2', 'day3'].map((dayKey, idx) => {
              const dayNum = idx + 1;
              const dayInfo = dayItineraries[idx];
              const selected = selectedCampsite[dayKey];
              const options = campsiteOptions[dayKey];
              const selectedSite = options?.find(s => s.name === selected);
              
              return (
                <div
                  key={dayKey}
                  onClick={() => setShowCampsiteModal(dayKey)}
                  className="group relative glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:border-amber-500/30"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ 
                        backgroundImage: `url(${selectedSite?.image || options?.[0]?.image})`,
                        filter: 'brightness(0.4)'
                      }}
                    />
                  </div>
                  
                  <div className="relative p-6 h-72 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-amber-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          Day {dayNum}
                        </span>
                        {selected && (
                          <span className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-light text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {dayInfo.title}
                      </h3>
                      <p className="text-white/60 text-sm">{dayInfo.route}</p>
                    </div>
                    
                    <div>
                      {selected ? (
                        <div className="glass-card rounded-xl p-3">
                          <p className="text-amber-400 text-sm font-medium">{selected}</p>
                          <p className="text-white/50 text-xs mt-0.5">{selectedSite?.vibe}</p>
                        </div>
                      ) : (
                        <div className="glass-card rounded-xl p-3 border-dashed border-amber-500/30 bg-amber-500/5">
                          <p className="text-amber-400/80 text-sm">Tap to select campsite →</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Day-by-Day Timeline Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400/80 tracking-[0.3em] uppercase text-sm mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              The Journey
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Day-by-Day <span className="text-gradient">Itinerary</span>
            </h2>
          </div>
          
          {/* Day Selector */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
            {dayItineraries.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 px-5 py-3 rounded-xl transition-all duration-300 ${
                  activeDay === idx
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'glass-card text-white/60 hover:text-white hover:border-amber-500/30'
                }`}
              >
                <span className="block text-xs opacity-70 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Day {day.num}</span>
                <span className="block font-medium text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{day.title}</span>
              </button>
            ))}
          </div>
          
          {/* Active Day Content */}
          {dayItineraries.map((day, dayIdx) => (
            <div key={dayIdx} className={`${activeDay === dayIdx ? 'block' : 'hidden'}`}>
              {/* Day Header Card */}
              <div className="glass-card rounded-2xl overflow-hidden mb-6">
                <div className="flex flex-col md:flex-row">
                  <div 
                    className="md:w-1/3 h-48 md:h-auto bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${day.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/90 hidden md:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent md:hidden" />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-5xl font-light text-gradient" style={{ fontFamily: 'Playfair Display, serif' }}>{day.num}</span>
                      <div>
                        <h3 className="text-2xl text-white font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{day.title}</h3>
                        <p className="text-white/50 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{day.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🛣️</span>
                        <span className="text-white/70 text-sm">{day.miles} miles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌡️</span>
                        <span className="text-white/70 text-sm">{day.weather}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span className="text-amber-400 text-sm font-medium">{day.highlight}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/60 text-sm">{day.route}</p>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {day.alerts && day.alerts.length > 0 && (
                <div className="mb-6 space-y-2">
                  {day.alerts.map((alert, aidx) => (
                    <div key={aidx} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <span className="text-xl">⚠️</span>
                      <p className="text-red-300 text-sm font-medium">{alert}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />
                
                <div className="space-y-4">
                  {day.checkpoints.map((checkpoint, cpIdx) => (
                    <div 
                      key={checkpoint.id}
                      className={`relative pl-16 transition-all duration-300 ${
                        isCheckpointDone(day.num, checkpoint.id) ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Timeline Node */}
                      <button
                        onClick={() => toggleCheckpoint(day.num, checkpoint.id)}
                        className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCheckpointDone(day.num, checkpoint.id)
                            ? 'bg-emerald-500 text-white'
                            : `bg-gradient-to-br ${getCheckpointColor(checkpoint.type)} text-white shadow-lg`
                        }`}
                        style={{ top: '1rem' }}
                      >
                        {isCheckpointDone(day.num, checkpoint.id) ? (
                          <span className="text-sm">✓</span>
                        ) : (
                          <span className="text-sm">{checkpoint.icon}</span>
                        )}
                      </button>
                      
                      {/* Content Card */}
                      <div 
                        className={`glass-card rounded-xl p-4 transition-all duration-300 cursor-pointer hover:border-amber-500/30 ${
                          checkpoint.mustVisit ? 'border-l-2 border-l-amber-500' : ''
                        } ${isCheckpointDone(day.num, checkpoint.id) ? 'bg-emerald-500/5' : ''}`}
                        onClick={() => toggleCheckpoint(day.num, checkpoint.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <span className="text-amber-400 text-xs font-medium px-2 py-0.5 bg-amber-500/20 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {checkpoint.time}
                              </span>
                              {checkpoint.mustVisit && (
                                <span className="text-xs text-amber-400/80 font-medium">MUST VISIT</span>
                              )}
                              {checkpoint.savings && (
                                <span className="text-emerald-400 text-xs font-medium px-2 py-0.5 bg-emerald-500/20 rounded-full">
                                  {checkpoint.savings}
                                </span>
                              )}
                            </div>
                            <h4 className={`text-lg font-medium mb-1 ${
                              isCheckpointDone(day.num, checkpoint.id) ? 'text-emerald-400 line-through' : 'text-white'
                            }`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                              {checkpoint.title}
                            </h4>
                            <p className="text-white/50 text-sm leading-relaxed">
                              {checkpoint.description}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                            isCheckpointDone(day.num, checkpoint.id)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/10 border border-white/20'
                          }`}>
                            {isCheckpointDone(day.num, checkpoint.id) && <span className="text-xs">✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              {day.tips && day.tips.length > 0 && (
                <div className="mt-8 glass-card rounded-xl p-5">
                  <h4 className="text-amber-400 text-sm font-medium mb-3 flex items-center gap-2">
                    <span>💡</span> Pro Tips
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {day.tips.map((tip, tidx) => (
                      <div key={tidx} className="flex items-start gap-2">
                        <span className="text-amber-400/60">•</span>
                        <p className="text-white/60 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-red-400/80 tracking-[0.3em] uppercase text-sm mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Save These Numbers
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Emergency Contacts
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, idx) => (
              <div 
                key={idx}
                className="glass-card rounded-xl p-5 border-red-500/20 hover:border-red-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">📞</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{contact.name}</p>
                    <p className="text-amber-400 font-mono text-sm">{contact.phone}</p>
                    <p className="text-white/40 text-xs">{contact.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-slate-900" />
      </footer>

      {/* Campsite Modal */}
      {showCampsiteModal && (
        <CampsiteModal 
          dayKey={showCampsiteModal} 
          onClose={() => setShowCampsiteModal(null)} 
        />
      )}
    </div>
  );
};

export default ExpeditionPlanner;
