package com.cdac.scanmark.serviceImplementation;

import com.cdac.scanmark.entities.Lecture;
import com.cdac.scanmark.repository.LectureRepository;
import com.cdac.scanmark.service.LectureService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LectureServiceImpl implements LectureService {

    private final LectureRepository lectureRepository;

    public LectureServiceImpl(LectureRepository lectureRepository) {
        this.lectureRepository = lectureRepository;
    }

    @Override
    public Lecture createLecture(Lecture lecture) {
        return lectureRepository.save(lecture); // Save new lecture
    }

    @Override
    public Lecture updateLecture(Long id, Lecture lecture) {
        Lecture existingLecture = getLectureById(id); // Fetch existing lecture
        existingLecture.setSubjectName(lecture.getSubjectName()); // Update lecture topic
        return lectureRepository.save(existingLecture); // Save updated lecture
    }

    @Override
    public Lecture getLectureById(Long id) {
        Optional<Lecture> lecture = lectureRepository.findById(id); // Find lecture by ID
        return lecture.orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + id));
    }

    @Override
    public List<Lecture> getAllLectures() {
        return lectureRepository.findAll(); // Fetch all lectures
    }

    @Override
    public void deleteLecture(Long id) {
        Lecture lecture = getLectureById(id); // Fetch lecture by ID
        lectureRepository.delete(lecture); // Delete lecture record
    }
}
