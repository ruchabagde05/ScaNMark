package com.cdac.scanmark.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // Bean for AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // Password encoder bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Security filter chain
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/auth/**",
                                "/api/coordinators/signup",
                                "/api/coordinators/verify-otp",
                                "/api/coordinators/forgot-password",
                                "/api/students/signin",
                                "/api/students/verify-otp",
                                "/api/students/forgot-password",
                                "/api/faculty/signin",
                                "/api/faculty/verify-otp", 
                                "/api/coordinators/signin",
                                "/attendance-dashboard.html",  
                                "/faculty-login.html", 
                                "/faculty-dashboard.html", 
                                "/student-login.html", 
                                "/student-dashboard.html", 
                                "/config/ngrok-url",
                                "/favicon.ico", 
                                "/api/lecture/lectures",
                                "/api/faculty/reset-password",
                                "/api/students/reset-password",
                                "/api/coordinators/reset-password",
                                "/api/faculty/forgot-password",
                                "/api/students/{prn}/attendance-percentage",
                                "/api/students/{prn}/attendance-percentage/subject-wise"
                                ).permitAll()  // Allow auth and login endpoints
                        .requestMatchers(
                                "/api/coordinators/profile",
                                "/api/coordinators/search-student/{prn}",
                                "/api/coordinators/search-attendance-by-date/{date}",
                                "/api/coordinators/faculty-history/{facultyCode}",
                                "/api/coordinators/updateStudent/{prn}",
                                "/api/coordinators/deleteStudent/{prn}",
                                "/api/coordinators/updateFaculty/{facultyCode}",
                                "/api/coordinators/deleteFaculty/{facultyCode}", 
                                "/api/coordinators/schedule-lecture", 
                                "/api/coordinators/add-faculty", 
                                "/api/coordinators/add-student", 
                                "/api/attendance/update-attendance/{id}", 
                                "/api/attendance/get-attendance-by-id/{id}", 
                                "/api/attendance/get-all-attendance", 
                                "/api/attendance/delete-attendance/{id}", 
                                "/api/attendance/get-attendance-by-student/{studentId}", 
                                "/api/attendance/get-attendance-by-lecture-id/{lectureId}", 
                                "/api/faculty/get-all-faculties", 
                                "/api/students/get-all-students",
                                "/api/attendance/attendance-by-prn/{prn}",
                                "/api/attendance/attendance-by-student-name/{name}",
                                "/api/attendance/current-months-attendance",
                                "/api/attendance/todays-attendance"
                                ).hasRole("COORDINATOR")  // Ensure only coordinators can access this endpoint
                        .requestMatchers(
                        "/api/faculty/profile",          
                        "/api/faculty/show-qr-again/{lectureId}",
                        "/api/lecture/lectures",
                        "/api/faculty/generate-qr/{lectureId}").hasRole("FACULTY")  // Ensure only faculty can access this endpoint
                        .requestMatchers(
                        "/api/students/profile", 
                        "/api/attendance/mark-attendance",
                        "/api/students/get-prn-through-token"
                        ).hasRole("STUDENT")  // Ensure only students can access this endpoint
                        .anyRequest().authenticated()  // Secure all other endpoints
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS configuration bean
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000","${external.url}")// Allow all origins (for development purposes)
                .allowedHeaders("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true)
                .maxAge(3600) ;
            }
        };
    }
}
