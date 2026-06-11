package com.example.bookingservice.service.impl;

import com.example.bookingservice.dto.request.ReservationRequest;
import com.example.bookingservice.dto.response.ReservationResponse;
import com.example.bookingservice.entity.Reservation;
import com.example.bookingservice.exception.ResourceNotFoundException;
import com.example.bookingservice.repository.ReservationRepository;
import com.example.bookingservice.service.ReservationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ReservationServiceImpl implements ReservationService {
    private static final Logger log = LoggerFactory.getLogger(ReservationServiceImpl.class);
    private final ReservationRepository repo;
    public ReservationServiceImpl(ReservationRepository repo) { this.repo = repo; }

    @Override public ReservationResponse create(ReservationRequest req) {
        log.info("Creating reservation: bookingId={}, inventoryId={}", req.getBookingId(), req.getInventoryId());
        Reservation r = new Reservation();
        r.setBookingId(req.getBookingId()); r.setInventoryId(req.getInventoryId());
        r.setCheckIn(req.getCheckIn()); r.setCheckOut(req.getCheckOut());
        r.setStatus(Reservation.Status.HELD); r.setGuestCount(req.getGuestCount());
        return toResponse(repo.save(r));
    }
    @Override public ReservationResponse update(Long id, ReservationRequest req) {
        Reservation r = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
        r.setBookingId(req.getBookingId()); r.setInventoryId(req.getInventoryId());
        r.setCheckIn(req.getCheckIn()); r.setCheckOut(req.getCheckOut()); r.setGuestCount(req.getGuestCount());
        return toResponse(repo.save(r));
    }
    @Override public ReservationResponse getById(Long id) { return toResponse(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id))); }
    @Override public Page<ReservationResponse> getAll(Pageable p) { return repo.findAll(p).map(this::toResponse); }
    @Override public void delete(Long id) { repo.deleteById(id); }

    private ReservationResponse toResponse(Reservation r) {
        ReservationResponse res = new ReservationResponse();
        res.setReservationId(r.getReservationId()); res.setBookingId(r.getBookingId());
        res.setInventoryId(r.getInventoryId()); res.setCheckIn(r.getCheckIn());
        res.setCheckOut(r.getCheckOut()); res.setStatus(r.getStatus().name());
        res.setGuestCount(r.getGuestCount()); res.setCreatedAt(r.getCreatedAt()); res.setCreatedBy(r.getCreatedBy());
        return res;
    }
}