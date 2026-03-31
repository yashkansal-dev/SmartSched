"""
CSV parsing utilities for SmartSched
"""

import pandas as pd
import io
from timetable.models import Faculty, Subject, Section

class CSVParser:
    """Parse CSV files and import data into database"""
    
    @staticmethod
    def parse_faculty_csv(file_obj):
        """
        Parse faculty CSV
        Expected columns: name, email, department, max_hours_per_week
        """
        try:
            df = pd.read_csv(file_obj)
            
            # Validate required columns
            required_cols = {'name', 'email', 'department', 'max_hours_per_week'}
            if not required_cols.issubset(set(df.columns)):
                raise ValueError(f"Missing required columns: {required_cols - set(df.columns)}")
            
            imported = []
            errors = []
            
            for idx, row in df.iterrows():
                try:
                    faculty, created = Faculty.objects.get_or_create(
                        email=row['email'],
                        defaults={
                            'name': row['name'],
                            'department': row['department'],
                            'max_hours_per_week': int(row['max_hours_per_week'])
                        }
                    )
                    imported.append(faculty)
                except Exception as e:
                    errors.append(f"Row {idx + 2}: {str(e)}")
            
            return {
                'success': len(imported),
                'total': len(df),
                'imported': imported,
                'errors': errors
            }
        
        except Exception as e:
            raise ValueError(f"Error parsing faculty CSV: {str(e)}")
    
    @staticmethod
    def parse_subject_csv(file_obj):
        """
        Parse subject CSV
        Expected columns: name, code, subject_type, hours_per_week, faculty_email
        """
        try:
            df = pd.read_csv(file_obj)
            
            required_cols = {'name', 'code', 'subject_type', 'hours_per_week', 'faculty_email'}
            if not required_cols.issubset(set(df.columns)):
                raise ValueError(f"Missing required columns: {required_cols - set(df.columns)}")
            
            imported = []
            errors = []
            
            for idx, row in df.iterrows():
                try:
                    faculty = Faculty.objects.get(email=row['faculty_email'])
                    
                    subject, created = Subject.objects.get_or_create(
                        code=row['code'],
                        defaults={
                            'name': row['name'],
                            'subject_type': row['subject_type'],
                            'hours_per_week': int(row['hours_per_week']),
                            'faculty': faculty
                        }
                    )
                    imported.append(subject)
                except Faculty.DoesNotExist:
                    errors.append(f"Row {idx + 2}: Faculty not found for email {row['faculty_email']}")
                except Exception as e:
                    errors.append(f"Row {idx + 2}: {str(e)}")
            
            return {
                'success': len(imported),
                'total': len(df),
                'imported': imported,
                'errors': errors
            }
        
        except Exception as e:
            raise ValueError(f"Error parsing subject CSV: {str(e)}")
    
    @staticmethod
    def parse_section_csv(file_obj):
        """
        Parse section CSV
        Expected columns: name, semester, total_students
        """
        try:
            df = pd.read_csv(file_obj)
            
            required_cols = {'name', 'semester', 'total_students'}
            if not required_cols.issubset(set(df.columns)):
                raise ValueError(f"Missing required columns: {required_cols - set(df.columns)}")
            
            imported = []
            errors = []
            
            for idx, row in df.iterrows():
                try:
                    section, created = Section.objects.get_or_create(
                        name=row['name'],
                        defaults={
                            'semester': int(row['semester']),
                            'total_students': int(row['total_students'])
                        }
                    )
                    imported.append(section)
                except Exception as e:
                    errors.append(f"Row {idx + 2}: {str(e)}")
            
            return {
                'success': len(imported),
                'total': len(df),
                'imported': imported,
                'errors': errors
            }
        
        except Exception as e:
            raise ValueError(f"Error parsing section CSV: {str(e)}")
