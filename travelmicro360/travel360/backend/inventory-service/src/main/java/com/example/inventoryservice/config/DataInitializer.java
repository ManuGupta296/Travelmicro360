package com.example.inventoryservice.config;

import com.example.inventoryservice.entity.Partner;
import com.example.inventoryservice.repository.InventoryRepository;
import com.example.inventoryservice.repository.PartnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final PartnerRepository partnerRepo;
    private final InventoryRepository inventoryRepo;
    private final DataSource dataSource;

    public DataInitializer(PartnerRepository partnerRepo, InventoryRepository inventoryRepo, DataSource dataSource) {
        this.partnerRepo = partnerRepo;
        this.inventoryRepo = inventoryRepo;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        seedBasePartners();   // base partners only — SQL files below own ALL inventory
        seedFromSql();
        log.info(">>> Inventory total after seeding: {} rows, {} partners <<<",
                inventoryRepo.count(), partnerRepo.count());
    }

    /** Base partners referenced by seed_bulk_inventory.sql (Air India, Taj, Uber, …). */
    private void seedBasePartners() {
        if (partnerRepo.count() > 0) return; // already seeded
        createPartner("Air India",       Partner.Type.AIRLINE);
        createPartner("IndiGo",          Partner.Type.AIRLINE);
        createPartner("Emirates",        Partner.Type.AIRLINE);
        createPartner("Vistara",         Partner.Type.AIRLINE);
        createPartner("SpiceJet",        Partner.Type.AIRLINE);
        createPartner("Marriott Hotels", Partner.Type.HOTEL);
        createPartner("Taj Hotels",      Partner.Type.HOTEL);
        createPartner("Hyatt Regency",   Partner.Type.HOTEL);
        createPartner("The Oberoi",      Partner.Type.HOTEL);
        createPartner("ITC Hotels",      Partner.Type.HOTEL);
        createPartner("Ola Cabs",        Partner.Type.TRANSPORT);
        createPartner("Uber",            Partner.Type.TRANSPORT);
        log.info(">>> Base partners seeded: {} <<<", partnerRepo.count());
    }

    private Partner createPartner(String name, Partner.Type type) {
        Partner p = new Partner();
        p.setName(name);
        p.setType(type);
        p.setStatus(Partner.Status.ACTIVE);
        return partnerRepo.save(p);
    }

    /**
     * Loads all seed_*.sql files in db/ in dependency order.
     * Partners are seeded above first, so seed_bulk_inventory's partner lookups resolve.
     * Each load is wrapped in try/catch so one bad file can't break startup.
     */
    private void seedFromSql() {
        // sentinel == null  -> file is idempotent (WHERE NOT EXISTS), always safe to run
        // sentinel != null  -> file is NOT idempotent; skip if that row already exists
        List<SeedScript> scripts = List.of(
            new SeedScript("db/seed_bulk_inventory.sql",    "IndiGo BOM-DEL 06:15"), // 25 flights + 20 hotels + 15 transport
            new SeedScript("db/seed_popular_transport.sql", null),                   // 20 trains + 20 buses (both directions)
            new SeedScript("db/seed_ground_transport.sql",  null)                    // 4 trains + 4 buses
        );

        for (SeedScript s : scripts) {
            try {
                if (s.sentinel() != null && inventoryRepo.existsByName(s.sentinel())) {
                    log.info("Seed already present, skipping {}", s.path());
                    continue;
                }
                ClassPathResource resource = new ClassPathResource(s.path());
                if (!resource.exists()) {
                    log.warn("Seed script not found, skipping {}", s.path());
                    continue;
                }
                try (Connection conn = dataSource.getConnection()) {
                    // UTF-8 so the "→" in route names is loaded correctly on Windows.
                    ScriptUtils.executeSqlScript(conn, new EncodedResource(resource, StandardCharsets.UTF_8));
                }
                log.info(">>> Loaded seed script {} <<<", s.path());
            } catch (Exception e) {
                log.error("Failed loading seed {} (continuing startup): {}", s.path(), e.getMessage(), e);
            }
        }
    }

    private record SeedScript(String path, String sentinel) {}
}
