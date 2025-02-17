package com.cdac.scanmark.service;

import com.cdac.scanmark.entities.Lecture;

import java.util.List;

public interface LectureService {
    Lecture createLecture(Lecture lecture);

    Lecture updateLecture(Long id, Lecture lecture);

    Lecture getLectureById(Long id);

    List<Lecture> getAllLectures();

    void deleteLecture(Long id);
}
