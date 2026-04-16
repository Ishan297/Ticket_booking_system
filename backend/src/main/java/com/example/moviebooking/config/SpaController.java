package com.example.moviebooking.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React SPA for client-side routes when the UI is bundled into static resources.
 */
@Controller
public class SpaController {

    @GetMapping({
            "/",
            "/login",
            "/register",
            "/admin",
            "/my-bookings"
    })
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/movie/{movieId}")
    public String movie() {
        return "forward:/index.html";
    }

    @GetMapping("/booking/{showtimeId}")
    public String booking() {
        return "forward:/index.html";
    }

    @GetMapping("/confirm/{bookingId}")
    public String confirm() {
        return "forward:/index.html";
    }

    @GetMapping("/success/{bookingId}")
    public String success() {
        return "forward:/index.html";
    }
}
