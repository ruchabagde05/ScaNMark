package com.cdac.scanmark.repository;

import com.cdac.scanmark.entities.Coordinator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoordinatorRepository extends JpaRepository<Coordinator, Long> {

    @NonNull
    // Find a coordinator by their unique coordinator ID
    Optional<Coordinator> findById(@NonNull Long id);

    Optional<Coordinator> findByEmail(@NonNull String email) ;

    boolean existsByEmail(String email) ;
}
