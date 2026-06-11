package com.example.inventoryservice.config;

import com.example.inventoryservice.entity.Inventory;
import com.example.inventoryservice.entity.Partner;
import com.example.inventoryservice.repository.InventoryRepository;
import com.example.inventoryservice.repository.PartnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final PartnerRepository partnerRepo;
    private final InventoryRepository inventoryRepo;

    public DataInitializer(PartnerRepository partnerRepo, InventoryRepository inventoryRepo) {
        this.partnerRepo = partnerRepo;
        this.inventoryRepo = inventoryRepo;
    }

    @Override
    public void run(String... args) {
        seedGroundTransport(); // idempotent — adds TRAIN/BUS even if DB already has FLIGHT/HOTEL
        if (partnerRepo.count() > 0) return; // base seed already done

        // Partners
        Partner airIndia = createPartner("Air India", Partner.Type.AIRLINE);
        Partner indigo = createPartner("IndiGo", Partner.Type.AIRLINE);
        Partner emirates = createPartner("Emirates", Partner.Type.AIRLINE);
        Partner vistara = createPartner("Vistara", Partner.Type.AIRLINE);
        Partner spiceJet = createPartner("SpiceJet", Partner.Type.AIRLINE);

        Partner marriott = createPartner("Marriott Hotels", Partner.Type.HOTEL);
        Partner taj = createPartner("Taj Hotels", Partner.Type.HOTEL);
        Partner hyatt = createPartner("Hyatt Regency", Partner.Type.HOTEL);
        Partner oberoi = createPartner("The Oberoi", Partner.Type.HOTEL);
        Partner itc = createPartner("ITC Hotels", Partner.Type.HOTEL);

        Partner ola = createPartner("Ola Cabs", Partner.Type.TRANSPORT);
        Partner uber = createPartner("Uber", Partner.Type.TRANSPORT);

        // Flights
        createInventory(airIndia, "FLIGHT", "AI-101 Delhi → Mumbai", new BigDecimal("5500"), 120,
                "Departure: 06:00, Arrival: 08:10, Non-stop, Economy");
        createInventory(airIndia, "FLIGHT", "AI-302 Mumbai → Bangalore", new BigDecimal("6200"), 85,
                "Departure: 09:30, Arrival: 11:20, Non-stop, Economy");
        createInventory(airIndia, "FLIGHT", "AI-505 Delhi → Chennai", new BigDecimal("7100"), 60,
                "Departure: 14:00, Arrival: 16:45, Non-stop, Business");
        createInventory(indigo, "FLIGHT", "6E-221 Hyderabad → Delhi", new BigDecimal("4800"), 150,
                "Departure: 07:15, Arrival: 09:30, Non-stop, Economy");
        createInventory(indigo, "FLIGHT", "6E-445 Bangalore → Mumbai", new BigDecimal("4200"), 180,
                "Departure: 11:00, Arrival: 12:50, Non-stop, Economy");
        createInventory(indigo, "FLIGHT", "6E-789 Chennai → Kolkata", new BigDecimal("5600"), 90,
                "Departure: 16:30, Arrival: 19:00, Non-stop, Economy");
        createInventory(emirates, "FLIGHT", "EK-501 Mumbai → Dubai", new BigDecimal("22000"), 45,
                "Departure: 02:30, Arrival: 04:45, Non-stop, Business");
        createInventory(emirates, "FLIGHT", "EK-502 Delhi → Dubai", new BigDecimal("24500"), 30,
                "Departure: 04:00, Arrival: 06:30, Non-stop, First Class");
        createInventory(vistara, "FLIGHT", "UK-815 Delhi → Goa", new BigDecimal("6800"), 100,
                "Departure: 08:45, Arrival: 11:15, Non-stop, Premium Economy");
        createInventory(vistara, "FLIGHT", "UK-920 Mumbai → Delhi", new BigDecimal("5900"), 110,
                "Departure: 19:00, Arrival: 21:10, Non-stop, Economy");
        createInventory(spiceJet, "FLIGHT", "SG-111 Delhi → Jaipur", new BigDecimal("3200"), 140,
                "Departure: 06:30, Arrival: 07:30, Non-stop, Economy");
        createInventory(spiceJet, "FLIGHT", "SG-456 Bangalore → Hyderabad", new BigDecimal("3500"), 160,
                "Departure: 13:00, Arrival: 14:10, Non-stop, Economy");

        // Hotels
        createInventory(marriott, "HOTEL", "Marriott Suites - Mumbai", new BigDecimal("12000"), 25,
                "5-star, Sea View, Breakfast included, WiFi, Pool");
        createInventory(marriott, "HOTEL", "Courtyard by Marriott - Delhi", new BigDecimal("8500"), 40,
                "4-star, City Center, Breakfast included, WiFi");
        createInventory(taj, "HOTEL", "Taj Mahal Palace - Mumbai", new BigDecimal("25000"), 10,
                "5-star Heritage, Sea-facing, Spa, Multi-cuisine restaurant");
        createInventory(taj, "HOTEL", "Taj Bangalore", new BigDecimal("11000"), 30,
                "5-star, Business District, Pool, Gym, WiFi");
        createInventory(hyatt, "HOTEL", "Hyatt Regency - Chennai", new BigDecimal("9500"), 35,
                "5-star, Anna Salai, Rooftop Pool, Spa, WiFi");
        createInventory(hyatt, "HOTEL", "Grand Hyatt - Goa", new BigDecimal("15000"), 20,
                "5-star Resort, Beachfront, Spa, Pool, All-inclusive option");
        createInventory(oberoi, "HOTEL", "The Oberoi - Delhi", new BigDecimal("20000"), 15,
                "5-star Luxury, Lutyen's Delhi, Butler Service, Spa");
        createInventory(oberoi, "HOTEL", "The Oberoi Udaivilas - Udaipur", new BigDecimal("35000"), 8,
                "5-star Palace, Lake View, Heritage, Spa, Pool");
        createInventory(itc, "HOTEL", "ITC Grand Chola - Chennai", new BigDecimal("14000"), 20,
                "5-star Luxury, Guindy, Spa, Multiple Restaurants");
        createInventory(itc, "HOTEL", "ITC Maurya - Delhi", new BigDecimal("16000"), 18,
                "5-star, Diplomatic Enclave, Bukhara Restaurant, Spa");

        // Transport
        createInventory(ola, "TRANSPORT", "Ola Sedan - Airport Transfer Mumbai", new BigDecimal("800"), 200,
                "AC Sedan, Airport pickup/drop, 24/7 available");
        createInventory(ola, "TRANSPORT", "Ola SUV - City Tour Delhi", new BigDecimal("2500"), 50,
                "AC SUV, Full day (8hrs/80km), Chauffeur");
        createInventory(uber, "TRANSPORT", "Uber Premium - Airport Transfer Delhi", new BigDecimal("1200"), 100,
                "Premium Sedan, Airport pickup/drop, Meet & Greet");
        createInventory(uber, "TRANSPORT", "Uber XL - Bangalore City", new BigDecimal("1800"), 80,
                "SUV, Half day (4hrs/40km), Chauffeur");

        log.info(">>> Inventory demo data seeded: {} items, {} partners <<<", inventoryRepo.count(), partnerRepo.count());
    }

    private Partner createPartner(String name, Partner.Type type) {
        Partner p = new Partner();
        p.setName(name);
        p.setType(type);
        p.setStatus(Partner.Status.ACTIVE);
        return partnerRepo.save(p);
    }

    private void createInventory(Partner partner, String itemType, String name, BigDecimal price, int availability, String details) {
        Inventory inv = new Inventory();
        inv.setPartner(partner);
        inv.setItemType(itemType);
        inv.setName(name);
        inv.setPrice(price);
        inv.setAvailability(availability);
        inv.setStatus(Inventory.Status.AVAILABLE);
        inv.setDetails(details);
        inventoryRepo.save(inv);
    }

    private Partner findOrCreatePartner(String name, Partner.Type type) {
        return partnerRepo.findByName(name).orElseGet(() -> createPartner(name, type));
    }

    private void createIfMissing(Partner partner, String itemType, String name, BigDecimal price, int availability, String details) {
        if (inventoryRepo.existsByName(name)) return;
        createInventory(partner, itemType, name, price, availability, details);
    }

    private void seedGroundTransport() {
        Partner irctc  = findOrCreatePartner("IRCTC",       Partner.Type.TRANSPORT);
        Partner redbus = findOrCreatePartner("RedBus",      Partner.Type.TRANSPORT);
        Partner vrl    = findOrCreatePartner("VRL Travels", Partner.Type.TRANSPORT);

        long beforeTrain = inventoryRepo.count();

        // ---------- TRAIN (4) ----------
        createIfMissing(irctc, "TRAIN", "Train: Mumbai → Pune (AC Chair Car)",
                new BigDecimal("450"), 120,
                "{\"from\":\"BOM\",\"to\":\"PNQ\",\"class\":\"AC Chair Car\",\"departure\":\"06:30\",\"arrival\":\"10:15\",\"duration\":\"3h 45m\",\"operator\":\"IRCTC\"}");
        createIfMissing(irctc, "TRAIN", "Train: Delhi → Agra (Shatabdi Exec)",
                new BigDecimal("980"), 150,
                "{\"from\":\"DEL\",\"to\":\"AGR\",\"class\":\"Executive Class\",\"departure\":\"06:00\",\"arrival\":\"08:00\",\"duration\":\"2h\",\"operator\":\"IRCTC\"}");
        createIfMissing(irctc, "TRAIN", "Train: Bangalore → Chennai (AC Sleeper)",
                new BigDecimal("720"), 200,
                "{\"from\":\"BLR\",\"to\":\"MAA\",\"class\":\"AC Sleeper\",\"departure\":\"22:30\",\"arrival\":\"05:45\",\"duration\":\"7h 15m\",\"operator\":\"IRCTC\"}");
        createIfMissing(irctc, "TRAIN", "Train: Mumbai → Ahmedabad (Tejas Exp)",
                new BigDecimal("1100"), 90,
                "{\"from\":\"BOM\",\"to\":\"AMD\",\"class\":\"Premium AC\",\"departure\":\"15:40\",\"arrival\":\"22:30\",\"duration\":\"6h 50m\",\"operator\":\"IRCTC\"}");

        // ---------- BUS (4) ----------
        createIfMissing(redbus, "BUS", "Bus: Delhi → Jaipur (Volvo AC Seater)",
                new BigDecimal("550"), 45,
                "{\"from\":\"DEL\",\"to\":\"JAI\",\"vehicle\":\"Volvo AC Seater\",\"departure\":\"23:00\",\"duration\":\"5h 30m\",\"operator\":\"RedBus\"}");
        createIfMissing(vrl, "BUS", "Bus: Bangalore → Chennai (AC Sleeper)",
                new BigDecimal("720"), 40,
                "{\"from\":\"BLR\",\"to\":\"MAA\",\"vehicle\":\"AC Sleeper\",\"departure\":\"22:00\",\"duration\":\"6h\",\"operator\":\"VRL Travels\"}");
        createIfMissing(redbus, "BUS", "Bus: Mumbai → Goa (Multi-Axle Volvo)",
                new BigDecimal("950"), 36,
                "{\"from\":\"BOM\",\"to\":\"GOI\",\"vehicle\":\"Multi-Axle Volvo\",\"departure\":\"21:00\",\"duration\":\"12h\",\"operator\":\"RedBus\"}");
        createIfMissing(vrl, "BUS", "Bus: Pune → Hyderabad (Sleeper)",
                new BigDecimal("880"), 30,
                "{\"from\":\"PNQ\",\"to\":\"HYD\",\"vehicle\":\"AC Sleeper\",\"departure\":\"20:30\",\"duration\":\"11h\",\"operator\":\"VRL Travels\"}");

        long added = inventoryRepo.count() - beforeTrain;
        if (added > 0) {
            log.info(">>> Ground transport seeded: {} new rows (TRAIN + BUS) <<<", added);
        }
    }
}

