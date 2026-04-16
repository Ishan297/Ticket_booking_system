package com.example.moviebooking.controller;

import com.example.moviebooking.entity.Screen;
import com.example.moviebooking.entity.Theater;
import com.example.moviebooking.service.TheaterService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@CrossOrigin(origins = "*")
public class TheaterController {
    private final TheaterService theaterService;

    public TheaterController(TheaterService theaterService) {
        this.theaterService = theaterService;
    }

    @GetMapping
    public List<Theater> getTheaters(@RequestParam(required = false) String city) {
        return theaterService.findAll(city);
    }

    @GetMapping("/{id}")
    public Theater getTheater(@PathVariable Long id) {
        return theaterService.findById(id);
    }

    @GetMapping("/{id}/screens")
    public List<Screen> getScreens(@PathVariable Long id) {
        return theaterService.getScreens(id);
    }
}
