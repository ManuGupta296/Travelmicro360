package com.example.authservice.config;

import com.example.authservice.entity.Company;
import com.example.authservice.entity.User;
import com.example.authservice.repository.CompanyRepository;
import com.example.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final PasswordEncoder encoder;

    public DataInitializer(UserRepository userRepo, CompanyRepository companyRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo; this.companyRepo = companyRepo; this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        // Remove pre-multi-company demo accounts (one-time cleanup)
        String[] retired = {
                "traveler@demo.com", "agent@demo.com", "corporate@demo.com",
                "finance@demo.com", "compliance@demo.com", "admin@demo.com"
        };
        for (String e : retired) {
            userRepo.findByEmail(e).ifPresent(userRepo::delete);
        }

        // Companies
        seedCompany("Cognizant",     "cognizant.com");
        seedCompany("TCS",           "tcs.com");
        seedCompany("Infosys",       "infosys.com");
        seedCompany("Wipro",         "wipro.com");
        seedCompany("Accenture",     "accenture.com");
        seedCompany("HCL",           "hcltech.com");
        seedCompany("Tech Mahindra", "techmahindra.com");
        seedCompany("Capgemini",     "capgemini.com");
        seedCompany("Independent",   null);

        // Users
        upsert("Demo Traveler",          User.Role.TRAVELER,           "traveler@cognizant.com",            "9000000001");

        upsert("Cognizant Corp Manager", User.Role.CORPORATE_MANAGER,  "corporate.cognizant@cognizant.com", "9000000002");
        upsert("TCS Corp Manager",       User.Role.CORPORATE_MANAGER,  "corporate.tcs@tcs.com",             "9000000003");
        upsert("Infosys Corp Manager",   User.Role.CORPORATE_MANAGER,  "corporate.infy@infosys.com",        "9000000004");
        upsert("Wipro Corp Manager",     User.Role.CORPORATE_MANAGER,  "corporate.wipro@wipro.com",         "9000000005");
        upsert("Accenture Corp Manager", User.Role.CORPORATE_MANAGER,  "corporate.accenture@accenture.com", "9000000006");
        upsert("HCL Corp Manager",       User.Role.CORPORATE_MANAGER,  "corporate.hcl@hcltech.com",         "9000000007");
        upsert("Tech Mahindra Corp Mgr", User.Role.CORPORATE_MANAGER,  "corporate.techm@techmahindra.com",  "9000000008");
        upsert("Capgemini Corp Manager", User.Role.CORPORATE_MANAGER,  "corporate.capg@capgemini.com",      "9000000009");

        upsert("Demo Finance",           User.Role.FINANCE_OFFICER,    "finance@cognizant.com",             "9000000010");
        upsert("Demo Compliance",        User.Role.COMPLIANCE_OFFICER, "compliance@cognizant.com",          "9000000011");
        upsert("Demo Admin",             User.Role.ADMIN,              "admin@cognizant.com",               "9000000012");
        upsert("Demo Agent",             User.Role.TRAVEL_AGENT,       "agent@independent.com",             "9000000013");

        log.info(">>> Auth demo data seeded ({} retired removed, multi-company users active) <<<", retired.length);
    }

    private void seedCompany(String name, String domain) {
        Company c = companyRepo.findByName(name).orElseGet(Company::new);
        c.setName(name);
        c.setDomain(domain);
        companyRepo.save(c);
    }

    private void upsert(String name, User.Role role, String email, String phone) {
        User user = userRepo.findByEmail(email).orElseGet(User::new);
        user.setName(name); user.setRole(role); user.setEmail(email);
        user.setPhone(phone); user.setPassword(encoder.encode("demo123"));
        assignCompanyFromEmail(user);
        userRepo.save(user);
    }

    // Mirrors AuthServiceImpl.assignCompanyFromEmail so seeded users get same routing as registered ones.
    private void assignCompanyFromEmail(User user) {
        String email = user.getEmail();
        int at = email == null ? -1 : email.indexOf('@');
        Company match = null;
        if (at > 0 && at < email.length() - 1) {
            String domain = email.substring(at + 1).toLowerCase();
            match = companyRepo.findByDomain(domain).orElse(null);
        }
        if (match == null) {
            match = companyRepo.findByName("Independent").orElse(null);
        }
        if (match != null) {
            user.setCompany(match);
            user.setCompanyName(match.getName());
        }
    }
}
