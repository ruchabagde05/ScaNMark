package com.cdac.scanmark.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UtilityController {

    @GetMapping("/favicon.ico")
    @ResponseBody
    public void disableFavicon() {
        // Intentionally left blank to prevent favicon errors
    }
}

