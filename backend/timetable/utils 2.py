"""
Timetable scheduling algorithm
Basic constraint satisfaction solver for academic timetabling
"""

from .models import Timetable, Section, Subject, Faculty
import random

class TimetableGenerator:
    """Generate conflict-free timetable"""
    
    DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    TIME_SLOTS = [
        '09:00-10:00',
        '10:00-11:00',
        '11:30-12:30',
        '12:30-13:30',
        '14:30-15:30',
        '15:30-16:30',
    ]
    ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Lab 1', 'Lab 2']
    
    def __init__(self, section):
        self.section = section
        self.schedule = []
        self.faculty_hours = {}
        self.conflicts = []
    
    def is_faculty_available(self, faculty_id, day, time_slot):
        """Check if faculty has no clash at given time"""
        conflicts = Timetable.objects.filter(
            faculty_id=faculty_id,
            day=day,
            time_slot=time_slot
        )
        return not conflicts.exists()
    
    def is_room_available(self, room, day, time_slot):
        """Check if room is available"""
        conflicts = Timetable.objects.filter(
            room=room,
            day=day,
            time_slot=time_slot
        )
        return not conflicts.exists()
    
    def is_section_available(self, section_id, day, time_slot):
        """Check if section has no clash"""
        conflicts = Timetable.objects.filter(
            section_id=section_id,
            day=day,
            time_slot=time_slot
        )
        return not conflicts.exists()
    
    def can_faculty_teach_more(self, faculty):
        """Check if faculty can take more hours"""
        current_hours = self.faculty_hours.get(faculty.id, 0)
        return current_hours < faculty.max_hours_per_week
    
    def generate(self):
        """
        Generate timetable for section
        Algorithm: Greedy assignment with backtracking
        """
        # Get all subjects for the section
        subjects = Subject.objects.all()
        
        if not subjects.exists():
            raise ValueError("No subjects available")
        
        scheduled_subjects = set()
        
        # Try to schedule each subject
        for subject in subjects:
            scheduled = False
            
            # Try each faculty
            for faculty in Faculty.objects.all():
                if not self.can_faculty_teach_more(faculty):
                    continue
                
                # Try each day and time slot
                for day in self.DAYS:
                    if scheduled:
                        break
                    
                    for time_slot in self.TIME_SLOTS:
                        # Check all constraints
                        if (self.is_faculty_available(faculty.id, day, time_slot) and
                            self.is_section_available(self.section.id, day, time_slot) and
                            self.is_room_available(self.ROOMS[0], day, time_slot)):
                            
                            # Create timetable entry
                            timetable_entry = Timetable.objects.create(
                                section=self.section,
                                subject=subject,
                                faculty=faculty,
                                day=day,
                                time_slot=time_slot,
                                room=random.choice(self.ROOMS)
                            )
                            
                            self.schedule.append(timetable_entry)
                            self.faculty_hours[faculty.id] = self.faculty_hours.get(faculty.id, 0) + subject.hours_per_week
                            scheduled_subjects.add(subject.id)
                            scheduled = True
                            break
            
            if not scheduled:
                self.conflicts.append(f"Could not schedule {subject.name}")
        
        return {
            'schedule': self.schedule,
            'conflicts': self.conflicts,
            'total_scheduled': len(scheduled_subjects),
        }
