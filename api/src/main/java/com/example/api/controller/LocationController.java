package com.example.api.controller;

import com.example.api.model.Location;
import com.example.api.repository.LocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationRepository locationRepository;

    public LocationController(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @GetMapping
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable UUID id) {
        return locationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        Location savedLocation = locationRepository.save(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLocation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        return locationRepository.findById(id)
                .map(existing -> {
                    // Only update fields that are present in the request
                    if (updates.containsKey("name")) existing.setName((String) updates.get("name"));
                    if (updates.containsKey("description")) existing.setDescription((String) updates.get("description"));
                    if (updates.containsKey("x")) existing.setX(Double.valueOf(updates.get("x").toString()));
                    if (updates.containsKey("y")) existing.setY(Double.valueOf(updates.get("y").toString()));
                    if (updates.containsKey("width")) existing.setWidth(Double.valueOf(updates.get("width").toString()));
                    if (updates.containsKey("height")) existing.setHeight(Double.valueOf(updates.get("height").toString()));
                    if (updates.containsKey("color")) existing.setColor((String) updates.get("color"));
                    if (updates.containsKey("borderColor")) existing.setBorderColor((String) updates.get("borderColor"));
                    if (updates.containsKey("capacity")) existing.setCapacity(Integer.valueOf(updates.get("capacity").toString()));
                    return ResponseEntity.ok(locationRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable UUID id) {
        if (locationRepository.existsById(id)) {
            locationRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
