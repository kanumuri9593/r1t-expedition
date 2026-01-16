import React, { useState, useEffect, useCallback } from 'react';
import AddToHomeScreen from './AddToHomeScreen';

const ExpeditionPlanner = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [completedItems, setCompletedItems] = useState({});
  const [completedCheckpoints, setCompletedCheckpoints] = useState({});
  const [selectedCampsite, setSelectedCampsite] = useState({});
  const [showCampsiteModal, setShowCampsiteModal] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [notifications, setNotifications] = useState([]);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [copySuccess, setCopySuccess] = useState(null);

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

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Add notification
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Find nearby attractions (simplified version with predefined must-visit places)
  const findNearbyAttractions = useCallback((location) => {
    if (!location) return;

    const mustVisitPlaces = [
      { name: 'Luray Caverns', lat: 38.6631, lng: -78.4594, type: 'landmark', icon: '🏔️' },
      { name: 'Natural Bridge', lat: 37.6276, lng: -79.5431, type: 'landmark', icon: '🌉' },
      { name: 'Blue Ridge Parkway Visitor Center', lat: 36.5333, lng: -81.5167, type: 'viewpoint', icon: '🏞️' },
      { name: 'Wright Brothers Memorial', lat: 36.0133, lng: -75.6678, type: 'landmark', icon: '✈️' },
      { name: 'Jockey\'s Ridge State Park', lat: 35.9583, lng: -75.6333, type: 'adventure', icon: '🏜️' },
      { name: 'Pea Island National Wildlife Refuge', lat: 35.7167, lng: -75.4833, type: 'wildlife', icon: '🦅' },
    ];

    const nearby = mustVisitPlaces
      .map(place => ({
        ...place,
        distance: calculateDistance(location.lat, location.lng, place.lat, place.lng)
      }))
      .filter(place => place.distance <= 5 && place.distance > 0)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    if (nearby.length > 0) {
      setNearbyAttractions(nearby);
      nearby.forEach(place => {
        addNotification(
          `${place.icon} Nearby: ${place.name} (${place.distance.toFixed(1)} miles)`,
          'attraction'
        );
      });
    } else {
      setNearbyAttractions([]);
    }
  }, [calculateDistance, addNotification]);

  // Geolocation tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission('unsupported');
      return;
    }

    let watchId = null;
    let lastCheckTime = 0;
    const CHECK_INTERVAL = 30000; // Check every 30 seconds

    const requestLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted');
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          if (error.code === 1) {
            setLocationPermission('denied');
          } else {
            setLocationPermission('error');
          }
        }
      );
    };

    // Request initial permission
    requestLocation();

    // Watch position if permission granted
    if (locationPermission === 'granted' || locationPermission === 'prompt') {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - lastCheckTime < CHECK_INTERVAL) return;
          lastCheckTime = now;

          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          setLocationPermission('granted');

          // Check proximity to checkpoints
          const activeDayData = dayItineraries[activeDay];
          if (activeDayData && newLocation) {
            activeDayData.checkpoints.forEach((checkpoint) => {
              if (checkpoint.coordinates) {
                const distance = calculateDistance(
                  newLocation.lat,
                  newLocation.lng,
                  checkpoint.coordinates.lat,
                  checkpoint.coordinates.lng
                );
                if (distance <= 10 && distance > 0) {
                  addNotification(
                    `📍 Approaching: ${checkpoint.title} (${distance.toFixed(1)} miles away)`,
                    'checkpoint'
                  );
                }
              }
            });
          }

          // Find nearby attractions (simplified - using predefined locations)
          findNearbyAttractions(newLocation);
        },
        (error) => {
          if (error.code === 1) {
            setLocationPermission('denied');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeDay, locationPermission, addNotification, findNearbyAttractions, calculateDistance]);

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

  // Copy checkpoint to clipboard
  const copyCheckpointToClipboard = async (checkpoint, dayNum) => {
    const formattedText = `${checkpoint.icon} ${checkpoint.time} - ${checkpoint.title}\n${checkpoint.description}${checkpoint.savings ? `\n${checkpoint.savings}` : ''}`;
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopySuccess(checkpoint.id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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
    ],
    day4: [
      {
        name: 'Pilot Mountain State Park',
        location: 'Pinnacle, NC',
        elevation: '2,420 ft',
        vibe: 'Summit Serenity',
        description: 'Camp at the base of the iconic quartzite dome. Wake up to misty mountain views and hike to the summit for sunrise. One of NC\'s most dramatic landscapes.',
        features: ['Iconic summit views', 'Hiking trails', 'Rocky outcrops', 'Incredible sunrises'],
        image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
        rating: 4.8,
        price: '$28/night'
      },
      {
        name: 'Hanging Rock State Park',
        location: 'Danbury, NC',
        elevation: '2,500 ft',
        vibe: 'Waterfall Wonderland',
        description: 'Dramatic cliffs, hidden waterfalls, and panoramic views. The "crown jewel" of NC Piedmont parks. Your R1T tent perched above the clouds.',
        features: ['Waterfalls', 'Cliff views', 'Swimming lake', 'Dark skies'],
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800',
        rating: 4.9,
        price: '$28/night'
      },
      {
        name: 'Stone Mountain State Park',
        location: 'Roaring Gap, NC',
        elevation: '2,300 ft',
        vibe: 'Granite Giant',
        description: 'Camp beneath a 600-foot granite dome. Trout streams, historic homesteads, and some of the best stargazing in the Piedmont. Pure Appalachian magic.',
        features: ['Granite dome', 'Trout fishing', 'Waterfalls', 'Historic sites'],
        image: 'https://images.unsplash.com/photo-1445527815219-ecbfec67f4e4?w=800',
        rating: 4.7,
        price: '$28/night'
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
        { id: 'dep1', time: '06:30', title: 'Depart Jersey City', type: 'start', icon: '🚀', description: 'Battery preconditioned overnight. Start with 100% charge.', mustVisit: true, coordinates: { lat: 40.7178, lng: -74.0431 } },
        { id: 'charge1', time: '08:45', title: 'Tesla Supercharger - Manassas', type: 'charging', icon: '⚡', description: 'Wawa location • 8 stalls • 250kW • OFF-PEAK before 9AM = $0.29/kWh!', mustVisit: true, savings: 'Save ~$15 vs peak!', coordinates: { lat: 38.7509, lng: -77.4753 } },
        { id: 'call1', time: '10:00', title: 'Skyline Drive Status Check', type: 'call', icon: '📞', description: 'Call (540) 999-3500 to confirm road is open. Winter closures common!', mustVisit: true },
        { id: 'enter1', time: '10:30', title: 'Enter Shenandoah - Thornton Gap', type: 'scenic', icon: '🏔️', description: 'US-211 entrance. 105 miles of Blue Ridge beauty ahead. 75+ overlooks!', mustVisit: true, coordinates: { lat: 38.6632, lng: -78.3206 } },
        { id: 'view1', time: '11:30', title: 'Stony Man Overlook', type: 'viewpoint', icon: '📸', description: 'Mile 38.6 - Second highest peak in the park. Stunning valley views!', mustVisit: true, coordinates: { lat: 38.6250, lng: -78.3750 } },
        { id: 'lunch1', time: '12:30', title: 'Big Meadows Lodge', type: 'food', icon: '🍽️', description: 'Historic lodge with panoramic views. Try the blackberry ice cream!', mustVisit: false, coordinates: { lat: 38.5200, lng: -78.4400 } },
        { id: 'view2', time: '14:00', title: 'Dark Hollow Falls', type: 'hike', icon: '🥾', description: '1.4 mile round trip to a 70-foot waterfall. Easy trail.', mustVisit: false, coordinates: { lat: 38.5100, lng: -78.4300 } },
        { id: 'exit1', time: '15:00', title: 'Exit at Swift Run Gap', type: 'milestone', icon: '🛣️', description: 'Take US-33 West. Regen braking recovers significant range on descent!', mustVisit: true, coordinates: { lat: 38.4500, lng: -78.5500 } },
        { id: 'camp1', time: '17:00', title: 'Arrive Camp', type: 'camp', icon: '⛺', description: 'Set up R1T tent, enjoy mountain sunset. You made it!', mustVisit: true, coordinates: { lat: 38.9000, lng: -78.2000 } }
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
        { id: 'dep2', time: '05:30', title: 'Early Departure', type: 'start', icon: '🌅', description: 'Leave early to hit Supercharger during off-peak! Longest day ahead.', mustVisit: true, coordinates: { lat: 38.9000, lng: -78.2000 } },
        { id: 'charge2', time: '08:00', title: 'Tesla Supercharger - Virginia Beach', type: 'charging', icon: '⚡', description: '8 stalls • 250kW • OFF-PEAK 4AM-8AM = $0.23/kWh! BEST RATE!', mustVisit: true, savings: 'Save ~$20 vs peak!', coordinates: { lat: 36.8529, lng: -76.0150 } },
        { id: 'bridge2', time: '09:00', title: 'Hampton Roads Bridge-Tunnel', type: 'scenic', icon: '🌊', description: '3.5 mile engineering marvel. Views of naval ships and Chesapeake Bay.', mustVisit: true, coordinates: { lat: 36.9667, lng: -76.3000 } },
        { id: 'enter2', time: '11:30', title: 'Cross Wright Memorial Bridge', type: 'milestone', icon: '🏝️', description: 'Welcome to the Outer Banks! Barrier island adventure begins.', mustVisit: true, coordinates: { lat: 36.0333, lng: -75.6833 } },
        { id: 'stop2', time: '12:00', title: 'Bodie Island Lighthouse', type: 'photo', icon: '📸', description: 'Classic black & white striped lighthouse. Quick photo stop!', mustVisit: true, coordinates: { lat: 35.8181, lng: -75.5625 } },
        { id: 'lunch2', time: '12:30', title: 'Kill Devil Grill', type: 'food', icon: '🍔', description: 'Local favorite! Try the Outer Banks fish tacos.', mustVisit: false, coordinates: { lat: 36.0167, lng: -75.6667 } },
        { id: 'air2', time: '13:30', title: 'Air Down Tires - ORV Ramp 4', type: 'prep', icon: '🔧', description: 'Drop to 20 PSI. Use Soft Sand Mode. Air down BEFORE beach!', mustVisit: true, coordinates: { lat: 35.2500, lng: -75.5167 } },
        { id: 'beach2', time: '14:00', title: 'Beach Driving - Cape Hatteras', type: 'adventure', icon: '🏖️', description: '20 miles of pristine beach driving. Watch for wildlife!', mustVisit: true, coordinates: { lat: 35.2167, lng: -75.6167 } },
        { id: 'lighthouse2', time: '15:30', title: 'Cape Hatteras Lighthouse', type: 'landmark', icon: '🗼', description: 'Americas tallest brick lighthouse. 257 steps to the top!', mustVisit: true, coordinates: { lat: 35.2503, lng: -75.6178 } },
        { id: 'camp2', time: '17:00', title: 'Oregon Inlet Campground', type: 'camp', icon: '⛺', description: 'Oceanfront camping! Set up with Atlantic sunset.', mustVisit: true, coordinates: { lat: 35.7667, lng: -75.5167 } }
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
        { id: 'pack3', time: '06:00', title: 'Pack Camp Thoroughly', type: 'prep', icon: '📦', description: 'No services on island! Ensure 80%+ battery. Pack all water/food for 36+ hrs.', mustVisit: true, coordinates: { lat: 35.7667, lng: -75.5167 } },
        { id: 'dep3', time: '07:30', title: 'Depart for Davis', type: 'start', icon: '🚗', description: 'Drive south on NC-12, then west to ferry terminal.', mustVisit: true, coordinates: { lat: 35.7667, lng: -75.5167 } },
        { id: 'ferry3', time: '09:30', title: 'Arrive Ferry Terminal', type: 'milestone', icon: '⛴️', description: 'Cape Lookout Cabins & Camps, Davis NC. Arrive 45 min early!', mustVisit: true, coordinates: { lat: 34.9000, lng: -76.3667 } },
        { id: 'board3', time: '10:00', title: 'Board Miss Tempie/Miss Brenda', type: 'adventure', icon: '🚢', description: '45-minute crossing to paradise. Vehicle ferry $135-175.', mustVisit: true, coordinates: { lat: 34.9000, lng: -76.3667 } },
        { id: 'arrive3', time: '10:45', title: 'Arrive Cape Lookout!', type: 'landmark', icon: '🏝️', description: 'Welcome to the ROADLESS barrier island. Check in at NPS office.', mustVisit: true, coordinates: { lat: 34.6167, lng: -76.5333 } },
        { id: 'air3', time: '11:00', title: 'Air Down Immediately', type: 'prep', icon: '🔧', description: 'Drop to 18-20 PSI right after ferry. All driving is soft sand!', mustVisit: true, coordinates: { lat: 34.6167, lng: -76.5333 } },
        { id: 'light3', time: '12:00', title: 'Cape Lookout Lighthouse', type: 'landmark', icon: '💎', description: 'The iconic diamond-patterned lighthouse. Best photos at golden hour!', mustVisit: true, coordinates: { lat: 34.6075, lng: -76.5364 } },
        { id: 'explore3', time: '13:00', title: 'Explore the Island', type: 'adventure', icon: '🐎', description: 'Wild horses roam free. Dolphins offshore. Shell hunting paradise.', mustVisit: true, coordinates: { lat: 34.6000, lng: -76.5500 } },
        { id: 'camp3', time: '15:00', title: 'Set Primitive Camp', type: 'camp', icon: '⛺', description: 'Above high tide, below dunes. The most incredible camping of your life.', mustVisit: true, coordinates: { lat: 34.6000, lng: -76.5500 } },
        { id: 'sunset3', time: '17:30', title: 'Sunset & Stargazing', type: 'experience', icon: '🌌', description: 'Zero light pollution. Milky Way visible. Pure magic.', mustVisit: true, coordinates: { lat: 34.6000, lng: -76.5500 } }
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
        { id: 'pack4', time: '05:30', title: 'Pack Camp - Leave No Trace', type: 'prep', icon: '🧹', description: 'Pack everything out. Leave the island pristine.', mustVisit: true, coordinates: { lat: 34.6000, lng: -76.5500 } },
        { id: 'drive4', time: '06:30', title: 'Drive to Great Island Dock', type: 'start', icon: '🚗', description: 'Return to ferry departure point.', mustVisit: true, coordinates: { lat: 34.6000, lng: -76.5500 } },
        { id: 'ferry4', time: '07:30', title: 'Board Return Ferry', type: 'milestone', icon: '⛴️', description: 'First ferry of the day. Goodbye paradise!', mustVisit: true, coordinates: { lat: 34.9000, lng: -76.3667 } },
        { id: 'air4', time: '08:15', title: 'Air Up at Davis', type: 'prep', icon: '🔧', description: 'Back to 42 PSI for highway driving.', mustVisit: true, coordinates: { lat: 34.9000, lng: -76.3667 } },
        { id: 'charge4a', time: '08:30', title: 'Tesla Supercharger - Morehead City', type: 'charging', icon: '⚡', description: '12 stalls • V4 325kW! Fastest charging of the trip!', mustVisit: true, savings: 'V4 = 15 min to 80%!', coordinates: { lat: 34.7229, lng: -76.7178 } },
        { id: 'drive4b', time: '10:30', title: 'Drive to Pilot Mountain', type: 'scenic', icon: '🛣️', description: 'Head northwest through NC Piedmont. Beautiful rural scenery.', mustVisit: true },
        { id: 'pilot4', time: '13:00', title: 'Pilot Mountain State Park', type: 'hike', icon: '🥾', description: '1.6 mile summit hike. 360° views of the Piedmont. Iconic knob!', mustVisit: true, coordinates: { lat: 36.3417, lng: -80.4700 } },
        { id: 'view4', time: '14:00', title: 'Big Pinnacle Overlook', type: 'viewpoint', icon: '📸', description: 'The money shot! Dramatic quartzite dome rising 1,400 feet.', mustVisit: true, coordinates: { lat: 36.3417, lng: -80.4700 } },
        { id: 'charge4b', time: '14:30', title: 'Tesla Supercharger - Winston-Salem', type: 'charging', icon: '⚡', description: 'Quick top-up if needed. 12 stalls • 250kW.', mustVisit: false, coordinates: { lat: 36.0999, lng: -80.2442 } },
        { id: 'arrive4', time: '16:00', title: 'Arrive Mount Airy', type: 'milestone', icon: '🏘️', description: 'The town that inspired Mayberry! Andy Griffith hometown.', mustVisit: true, coordinates: { lat: 36.4996, lng: -80.6073 } },
        { id: 'dinner4', time: '17:00', title: 'Snappy Lunch', type: 'food', icon: '🍽️', description: 'Famous pork chop sandwich since 1923. A MUST!', mustVisit: true, coordinates: { lat: 36.4996, lng: -80.6073 } },
        { id: 'floyd4', time: '18:00', title: 'Floyds Barber Shop', type: 'landmark', icon: '💈', description: 'The original shop from Andy Griffith Show. Photo op!', mustVisit: false, coordinates: { lat: 36.4996, lng: -80.6073 } }
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
        { id: 'dep5', time: '05:00', title: 'Ultra Early Departure', type: 'start', icon: '🌙', description: 'Leave in darkness to hit BOTH chargers at off-peak rates!', mustVisit: true, coordinates: { lat: 36.4996, lng: -80.6073 } },
        { id: 'drive5a', time: '05:30', title: 'I-77 North to I-81', type: 'scenic', icon: '🛣️', description: 'Beautiful mountain highway. Driver+ ready for the long haul.', mustVisit: true },
        { id: 'charge5a', time: '07:30', title: 'Tesla Supercharger - Wytheville', type: 'charging', icon: '⚡', description: '6 stalls • 150kW • OFF-PEAK = $0.33/kWh with Tesla Sub!', mustVisit: true, savings: 'Save ~$10 vs peak!', coordinates: { lat: 36.9487, lng: -81.0844 } },
        { id: 'breakfast5', time: '08:00', title: 'Waffle House Breakfast', type: 'food', icon: '🧇', description: 'Classic road trip fuel. Right next to Supercharger!', mustVisit: false, coordinates: { lat: 36.9487, lng: -81.0844 } },
        { id: 'drive5b', time: '08:30', title: 'I-81 Scenic Corridor', type: 'scenic', icon: '🏔️', description: 'Shenandoah Valley views. Rolling hills and farmland.', mustVisit: true },
        { id: 'charge5b', time: '11:00', title: 'Tesla Supercharger - Harrisburg', type: 'charging', icon: '⚡', description: '12 stalls • V4 325kW! • OFF-PEAK before 9AM = $0.27/kWh!', mustVisit: true, savings: 'V4 = 15 min charge!', coordinates: { lat: 40.2737, lng: -76.8844 } },
        { id: 'lunch5', time: '12:00', title: 'Lunch Break - Harrisburg', type: 'food', icon: '🍕', description: 'Stretch your legs. Final meal on the road.', mustVisit: false, coordinates: { lat: 40.2737, lng: -76.8844 } },
        { id: 'drive5c', time: '12:30', title: 'I-78 Final Push', type: 'milestone', icon: '🏁', description: 'Last leg home. 2.5 hours to Jersey City!', mustVisit: true },
        { id: 'home5', time: '15:00', title: 'ARRIVE HOME!', type: 'finish', icon: '🏠', description: '1,400+ miles complete! Park the R1T. You did it!', mustVisit: true, coordinates: { lat: 40.7178, lng: -74.0431 } },
        { id: 'clean5', time: '16:00', title: 'Clean Salt & Sand', type: 'maintenance', icon: '🧽', description: 'Rinse undercarriage within 48 hours. Protect your R1T!', mustVisit: true, coordinates: { lat: 40.7178, lng: -74.0431 } }
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
      {/* Add to Home Screen Popup */}
      <AddToHomeScreen />
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
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          /* Improve touch targets */
          button, a, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Prevent text size adjustment on iOS */
          input, textarea, select {
            font-size: 16px !important;
          }
        }
        
        /* Touch manipulation for better mobile performance */
        .touch-manipulation {
          touch-action: manipulation;
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
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light mb-6 animate-slide-up px-4"
            style={{ fontFamily: 'Playfair Display, serif', animationDelay: '0.2s' }}
          >
            <span className="text-white">R1T</span>
            <span className="text-gradient"> Southern</span>
            <br />
            <span className="text-white/90">Coast</span>
            <span className="text-gradient"> Expedition</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-12 mb-12 animate-slide-up px-4" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Two Friends</p>
              <p className="text-white/40 text-xs sm:text-sm tracking-wider uppercase">Adventurers</p>
            </div>
            <div className="w-px bg-white/10 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>1,400+</p>
              <p className="text-white/40 text-xs sm:text-sm tracking-wider uppercase">Miles</p>
            </div>
            <div className="w-px bg-white/10 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>5</p>
              <p className="text-white/40 text-xs sm:text-sm tracking-wider uppercase">Days</p>
            </div>
            <div className="w-px bg-white/10 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>3</p>
              <p className="text-white/40 text-xs sm:text-sm tracking-wider uppercase">States</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 text-sm animate-slide-up" style={{ fontFamily: 'JetBrains Mono, monospace', animationDelay: '0.4s' }}>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Skyline Drive</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Outer Banks</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Cape Lookout</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70">✦ Wild Horses</span>
          </div>
          
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
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
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin justify-start md:justify-center px-4 md:px-0 -mx-4 md:mx-0">
            {dayItineraries.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 touch-manipulation ${
                  activeDay === idx
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'glass-card text-white/60 active:text-white hover:text-white hover:border-amber-500/30'
                }`}
              >
                <span className="block text-xs opacity-70 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Day {day.num}</span>
                <span className="block font-medium text-xs sm:text-sm whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>{day.title}</span>
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
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="text-4xl sm:text-5xl font-light text-gradient" style={{ fontFamily: 'Playfair Display, serif' }}>{day.num}</span>
                      <div>
                        <h3 className="text-xl sm:text-2xl text-white font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{day.title}</h3>
                        <p className="text-white/50 text-xs sm:text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{day.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">🛣️</span>
                        <span className="text-white/70 text-xs sm:text-sm">{day.miles} miles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">🌡️</span>
                        <span className="text-white/70 text-xs sm:text-sm">{day.weather}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">✨</span>
                        <span className="text-amber-400 text-xs sm:text-sm font-medium">{day.highlight}</span>
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
              <div className="relative px-4 md:px-0">
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />
                
                <div className="space-y-4">
                  {day.checkpoints.map((checkpoint, cpIdx) => (
                    <div 
                      key={checkpoint.id}
                      className={`relative pl-12 md:pl-16 transition-all duration-300 ${
                        isCheckpointDone(day.num, checkpoint.id) ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Timeline Node */}
                      <button
                        onClick={() => toggleCheckpoint(day.num, checkpoint.id)}
                        className={`absolute left-1 md:left-3 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation active:scale-95 ${
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
                        className={`glass-card rounded-xl p-3 sm:p-4 transition-all duration-300 ${
                          checkpoint.mustVisit ? 'border-l-2 border-l-amber-500' : ''
                        } ${isCheckpointDone(day.num, checkpoint.id) ? 'bg-emerald-500/5' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
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
                            <h4 className={`text-base sm:text-lg font-medium mb-1 ${
                              isCheckpointDone(day.num, checkpoint.id) ? 'text-emerald-400 line-through' : 'text-white'
                            }`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                              {checkpoint.title}
                            </h4>
                            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                              {checkpoint.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyCheckpointToClipboard(checkpoint, day.num);
                              }}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all touch-manipulation active:scale-95 ${
                                copySuccess === checkpoint.id
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white/10 active:bg-white/20 text-white/60 active:text-white'
                              }`}
                              title="Copy checkpoint details"
                            >
                              {copySuccess === checkpoint.id ? '✓' : '📋'}
                            </button>
                            <button
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md flex-shrink-0 flex items-center justify-center transition-all touch-manipulation active:scale-95 ${
                                isCheckpointDone(day.num, checkpoint.id)
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white/10 border border-white/20'
                              }`}
                              onClick={() => toggleCheckpoint(day.num, checkpoint.id)}
                            >
                              {isCheckpointDone(day.num, checkpoint.id) && <span className="text-xs">✓</span>}
                            </button>
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
              Four nights of breathtaking views from your R1T tent. Tap to explore options.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {['day1', 'day2', 'day3', 'day4'].map((dayKey, idx) => {
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

      {/* Rivian R1T Vehicle Specs Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-amber-400/80 tracking-[0.3em] uppercase text-sm mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              The Vehicle
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Rivian <span className="text-gradient">R1T</span>
            </h2>
          </div>

          {/* Main Content */}
          <div className="glass-card rounded-3xl overflow-hidden p-8 lg:p-12">
            {/* Model Title and Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-sm rounded-full border border-amber-500/30 mb-6">
                <p className="text-amber-400 text-lg font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  🛻 Performance Dual Max
                </p>
              </div>
              <h3 className="text-3xl font-light text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Performance Dual Max
              </h3>
              <p className="text-amber-400/80 text-sm uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Adventure Package
              </p>
            </div>

            {/* Rivian Sticker Image */}
            <div className="flex justify-center items-center mb-12 px-4">
              <div 
                className="relative w-full max-w-lg"
                style={{
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src="/r1tsticker.png"
                  alt="Rivian R1T Sticker"
                  className="max-w-full h-auto"
                  style={{
                    maxHeight: '500px',
                    width: 'auto',
                    height: 'auto',
                    display: 'block'
                  }}
                  onLoad={() => {
                    console.log('✅ Rivian sticker image loaded successfully');
                  }}
                  onError={(e) => {
                    console.error('❌ Image failed to load from:', e.target.src);
                    console.error('Current URL:', window.location.href);
                    console.error('Trying alternative paths...');
                    // Try with process.env.PUBLIC_URL if available
                    if (process.env.PUBLIC_URL) {
                      e.target.src = `${process.env.PUBLIC_URL}/r1tsticker.png`;
                    }
                  }}
                />
              </div>
            </div>

            {/* Specifications */}
            <div>

                {/* Specs Grid */}
                <div className="space-y-8">
                  {/* Powertrain & Performance */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🔋</span>
                      <h4 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Powertrain & Performance
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Motor Configuration</p>
                        <p className="text-white text-sm font-medium">Dual Motor (All-Wheel Drive)</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Performance Tier</p>
                        <p className="text-white text-sm font-medium">Performance Dual Motor</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>0–60 mph</p>
                        <p className="text-white text-sm font-medium">~3.4 seconds</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Drive Modes</p>
                        <p className="text-white text-sm font-medium">All-Purpose, Sport, Conserve, Off-Road</p>
                      </div>
                    </div>
                  </div>

                  {/* Battery & Range */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🔋</span>
                      <h4 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Battery & Range
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Battery Pack</p>
                        <p className="text-white text-sm font-medium">Max Pack</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Usable Capacity</p>
                        <p className="text-white text-sm font-medium">~149 kWh</p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 md:col-span-2">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>EPA-Estimated Range (21" Road wheels)</p>
                        <p className="text-emerald-400 text-sm font-medium">Up to ~420 miles (≈ 676 km) in Conserve mode</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>DC Fast Charging</p>
                        <p className="text-white text-sm font-medium">Up to ~220 kW</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Level-2 AC Charging</p>
                        <p className="text-white text-sm font-medium">~25–30 miles/hour (11.5 kW)</p>
                      </div>
                    </div>
                  </div>

                  {/* Wheels & Suspension */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🛞</span>
                      <h4 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Wheels & Suspension
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Wheels</p>
                        <p className="text-white text-sm font-medium">21" Road</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10 md:col-span-2">
                        <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Suspension</p>
                        <p className="text-white text-sm font-medium">Adaptive Air Suspension • Adjustable ride height • Auto-leveling • On-road + off-road tuning</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Assistance */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🧭</span>
                      <h4 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Driver Assistance
                      </h4>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-blue-400 text-sm font-medium mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        System: Driver+
                      </p>
                      <div className="grid md:grid-cols-2 gap-2">
                        <p className="text-white/70 text-xs">• Highway Assist (hands-on)</p>
                        <p className="text-white/70 text-xs">• Adaptive Cruise Control</p>
                        <p className="text-white/70 text-xs">• Lane Keep Assist</p>
                        <p className="text-white/70 text-xs">• Blind Spot Monitoring</p>
                        <p className="text-white/70 text-xs">• Automatic Emergency Braking</p>
                        <p className="text-white/70 text-xs">• Driver Monitoring Camera</p>
                      </div>
                    </div>
                  </div>

                  {/* Exterior & Interior */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🏔️</span>
                        <h4 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Exterior
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Color</p>
                          <p className="text-white text-sm font-medium">El Cap Granite</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Body Style</p>
                          <p className="text-white text-sm font-medium">Quad-cab electric pickup</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Lighting</p>
                          <p className="text-white text-sm font-medium">Signature Rivian LED light bar</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🪵</span>
                        <h4 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Interior
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Interior Color</p>
                          <p className="text-white text-sm font-medium">Black Mountain</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Trim</p>
                          <p className="text-white text-sm font-medium">Dark Ash Wood</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Seating</p>
                          <p className="text-white text-sm font-medium">Premium vegan leather</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Cabin Philosophy</p>
                          <p className="text-white text-sm font-medium">Minimalist, sustainable materials</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Adventure Package Highlights */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🧰</span>
                      <h4 className="text-xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Adventure Package Highlights
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 text-sm font-medium">Gear Tunnel</p>
                        <p className="text-white/60 text-xs mt-1">Iconic R1T feature</p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 text-sm font-medium">Powered Tonneau</p>
                        <p className="text-white/60 text-xs mt-1">Compatibility included</p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 text-sm font-medium">120V Outlets + Air Compressor</p>
                        <p className="text-white/60 text-xs mt-1">Multiple outlets</p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 text-sm font-medium">Heavy-Duty Protection</p>
                        <p className="text-white/60 text-xs mt-1">Skid protection & tow hooks</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
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
                        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-300 text-left touch-manipulation active:scale-[0.98] ${
                          isCompleted(category.id, item.name)
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-white/5 border border-white/10 active:border-amber-500/30 active:bg-white/10'
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-block glass-card rounded-xl p-5">
            <p className="text-white/60 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Safe travels. Leave no trace.<br />
              <span className="text-gradient font-medium">Adventure awaits.</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Campsite Modal */}
      {showCampsiteModal && (
        <CampsiteModal 
          dayKey={showCampsiteModal} 
          onClose={() => setShowCampsiteModal(null)} 
        />
      )}

      {/* Notifications */}
      <div className="fixed bottom-4 right-2 sm:right-4 z-50 space-y-2 max-w-[calc(100vw-1rem)] sm:max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`glass-card rounded-xl p-4 shadow-lg border ${
              notification.type === 'checkpoint'
                ? 'border-amber-500/30 bg-amber-500/10'
                : notification.type === 'attraction'
                ? 'border-blue-500/30 bg-blue-500/10'
                : 'border-white/20'
            } animate-slide-up`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-white text-sm flex-1">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Location Permission Prompt */}
      {locationPermission === 'denied' && (
        <div className="fixed bottom-4 left-2 sm:left-4 z-50 max-w-[calc(100vw-1rem)] sm:max-w-sm">
          <div className="glass-card rounded-xl p-4 border border-amber-500/30 bg-amber-500/10">
            <p className="text-white text-sm mb-3">
              Enable location to get alerts for nearby checkpoints and attractions!
            </p>
            <button
              onClick={() => {
                setLocationPermission('prompt');
                navigator.geolocation.getCurrentPosition(
                  () => setLocationPermission('granted'),
                  () => setLocationPermission('denied')
                );
              }}
              className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Enable Location
            </button>
          </div>
        </div>
      )}

      {/* Nearby Attractions Panel */}
      {nearbyAttractions.length > 0 && currentLocation && (
        <div className="fixed top-20 right-2 sm:right-4 z-40 max-w-[calc(100vw-1rem)] sm:max-w-xs">
          <div className="glass-card rounded-xl p-4 border border-blue-500/30">
            <h4 className="text-blue-400 text-sm font-medium mb-3 flex items-center gap-2">
              <span>📍</span> Nearby Attractions
            </h4>
            <div className="space-y-2">
              {nearbyAttractions.map((place, idx) => (
                <div key={idx} className="text-white/70 text-xs">
                  {place.icon} {place.name} ({place.distance.toFixed(1)} mi)
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpeditionPlanner;