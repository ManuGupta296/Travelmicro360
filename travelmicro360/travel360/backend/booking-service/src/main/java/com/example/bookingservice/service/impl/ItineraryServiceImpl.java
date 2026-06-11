package com.example.bookingservice.service.impl;

import com.example.bookingservice.dto.request.ItineraryRequest;
import com.example.bookingservice.dto.response.ItineraryResponse;
import com.example.bookingservice.entity.Itinerary;
import com.example.bookingservice.exception.ResourceNotFoundException;
import com.example.bookingservice.repository.ItineraryRepository;
import com.example.bookingservice.service.ItineraryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class ItineraryServiceImpl implements ItineraryService {
    private static final Logger log = LoggerFactory.getLogger(ItineraryServiceImpl.class);
    private final ItineraryRepository repo;
    public ItineraryServiceImpl(ItineraryRepository repo) { this.repo = repo; }

    @Override public ItineraryResponse create(ItineraryRequest req) {
        log.info("Creating itinerary: customerId={}, title={}", req.getCustomerId(), req.getTitle());
        Itinerary i = new Itinerary();
        i.setCustomerId(req.getCustomerId()); i.setTitle(req.getTitle());
        i.setStartDate(req.getStartDate()); i.setEndDate(req.getEndDate()); i.setNotes(req.getNotes());
        return toResponse(repo.save(i));
    }
    @Override public ItineraryResponse update(Long id, ItineraryRequest req) {
        Itinerary i = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Itinerary not found: " + id));
        i.setCustomerId(req.getCustomerId()); i.setTitle(req.getTitle());
        i.setStartDate(req.getStartDate()); i.setEndDate(req.getEndDate()); i.setNotes(req.getNotes());
        return toResponse(repo.save(i));
    }
    @Override public ItineraryResponse getById(Long id) { return toResponse(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Itinerary not found: " + id))); }
    @Override public Page<ItineraryResponse> getAll(Pageable p) { return repo.findAll(p).map(this::toResponse); }
    @Override public void delete(Long id) { repo.deleteById(id); }

    @Override
    public Itinerary autoCreate(Long customerId, Long bookingId, LocalDate date) {
        // ±3 day window: endDate > date-4 AND startDate < date+4
        List<Itinerary> candidates = repo.findByCustomerIdAndEndDateAfterAndStartDateBefore(
                customerId, date.minusDays(4), date.plusDays(4));
        Itinerary target = candidates.stream()
                .filter(it -> it.getStatus() != Itinerary.Status.CANCELLED)
                .findFirst()
                .orElse(null);

        if (target != null) {
            Set<String> ids = new LinkedHashSet<>();
            if (target.getBookings() != null && !target.getBookings().isBlank()) {
                Arrays.stream(target.getBookings().split(","))
                        .map(String::trim).filter(s -> !s.isEmpty()).forEach(ids::add);
            }
            ids.add(String.valueOf(bookingId));
            target.setBookings(String.join(",", ids));
            if (target.getStartDate() == null || date.isBefore(target.getStartDate())) target.setStartDate(date);
            if (target.getEndDate() == null   || date.isAfter(target.getEndDate()))   target.setEndDate(date);
            return repo.save(target);
        }

        Itinerary i = new Itinerary();
        i.setCustomerId(customerId);
        i.setTitle("Trip " + date);
        i.setStartDate(date);
        i.setEndDate(date);
        i.setStatus(Itinerary.Status.CONFIRMED);
        i.setBookings(String.valueOf(bookingId));
        return repo.save(i);
    }

    private ItineraryResponse toResponse(Itinerary i) {
        ItineraryResponse r = new ItineraryResponse();
        r.setItineraryId(i.getItineraryId()); r.setCustomerId(i.getCustomerId());
        r.setTitle(i.getTitle()); r.setStartDate(i.getStartDate()); r.setEndDate(i.getEndDate());
        r.setNotes(i.getNotes()); r.setCreatedAt(i.getCreatedAt()); r.setCreatedBy(i.getCreatedBy());
        if (i.getStatus() != null) r.setStatus(i.getStatus().name());
        r.setBookings(i.getBookings());
        return r;
    }
}