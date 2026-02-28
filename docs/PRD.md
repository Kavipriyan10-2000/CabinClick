# CabinClick - Product Requirements Document (PRD)

## Overview
CabinClick is an in-flight passenger and crew interaction application designed to elevate the flight experience. It bridges the communication gap between passengers and flight attendants while providing a suite of entertainment, ordering, and flight information features.

## Target Audience
1. **Passengers**: Travelers seeking a comfortable, engaging, and seamless in-flight experience.
2. **Flight Crew**: Attendants who need an efficient way to manage passenger requests, communicate, and track inventory.

## Features

### Passenger Interface (The "Seat Screen" / Mobile App)
- **Call Attendant**: A categorized request system (e.g., "Need Water", "Medical Issue", "Blanket") to reduce unnecessary trips for the crew.
- **Food & Beverage Ordering**: A digital menu allowing passengers to order complimentary and paid items directly to their seat.
- **Flight Status & Map**: Real-time flight tracking, ETA, altitude, and weather updates.
- **In-flight Entertainment (IFE)**: Access to a curated list of movies, TV shows, games, and music.
- **Seat-to-Seat Chat**: (Optional/Opt-in) Secure messaging with other passengers.
- **Duty-Free Shopping**: Browse and purchase items to be delivered by the crew.

### Crew Interface (Tablet / Mobile App)
- **Request Dashboard**: A centralized, prioritized queue of passenger requests with seat numbers and statuses (Pending, In Progress, Completed).
- **Passenger Manifest**: Interactive seat map displaying passenger details, loyalty status, and special requirements (e.g., dietary restrictions, mobility needs).
- **Crew Communication**: Secure, instant messaging channel for flight attendants and pilots.
- **Inventory Management**: Real-time tracking of food, beverages, and duty-free items.
- **Announcement System**: Push text or audio notifications to passenger screens (e.g., "Fasten Seatbelts", "Turbulence ahead").

## Technical Considerations
- **Offline/Local Network Operation**: The app must function reliably on the localized airplane Wi-Fi network without requiring external internet access, syncing data to a local server on the aircraft.
- **Responsive Design**: Must work across varying screen sizes (seatback screens, tablets, mobile devices).
- **Real-time Sync**: WebSockets or similar technology for instant communication between passenger and crew devices.
