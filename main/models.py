# -*- coding: utf-8 -*-

from django.db import models
from django.dispatch import receiver
import os


class Subdivision(models.Model):
    subdivision_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300, null=True)
    tel = models.CharField(max_length=100, null=False)


class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=300, null=True)
    tel = models.CharField(max_length=100, null=False)
    mail = models.CharField(max_length=50, null=False)
    subdivision = models.ForeignKey(Subdivision, null=False)


class Authors(models.Model):
    author_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=45, null=False)
    surname = models.CharField(max_length=45, null=True)
    patronymic = models.CharField(max_length=50, null=True)
    tel = models.CharField(max_length=100, null=True)
    mail = models.CharField(max_length=50, null=True)
    post = models.CharField(max_length=200, null=True)
    department = models.ForeignKey(Department, null=True, on_delete=models.SET_NULL)


class Tags(models.Model):
    tag_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, null=False)


class DocumentTypes(models.Model):
    doc_type_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)


class Directions(models.Model):
    direction_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, null=False)


class IntellectualProperty(models.Model):
    intellectual_property_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=500, null=False)
    code = models.CharField(max_length=50, null=False)
    start_date = models.DateField(null=True)
    public_date = models.DateField(null=True)
    end_date = models.DateField(null=True)
    doc_type = models.ForeignKey(DocumentTypes, null=True, on_delete=models.SET_NULL)
    direction = models.ForeignKey(Directions, null=True, on_delete=models.SET_NULL)
    authors = models.ManyToManyField(Authors, null=True)
    tags = models.ManyToManyField(Tags, null=True)


class DownloadDir(models.Model):
    download_dir_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, null=False)
    intellectual_property = models.ManyToManyField(IntellectualProperty, null=False)


def get_upload_folder(instance, filename):
    return os.path.join(
        "%d" % instance.intellectual_property.intellectual_property_id, filename)


class Files(models.Model):
    file_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, null=False)
    size = models.FloatField(null=True)
    extension = models.CharField(max_length=5, null=True)
    file = models.FileField(upload_to=get_upload_folder, null=False) #upload_to="documents/%Y/%m/%d"
    intellectual_property = models.ForeignKey(IntellectualProperty, null=False)


@receiver(models.signals.post_delete, sender=Files)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Удалить файл при удаление соответствуюшей записи из БД
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)


@receiver(models.signals.pre_save, sender=Files)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Удалить файл при изменение соответствуюшей записи из БД
    """
    if not instance.pk:
        return False
    try:
        old_file = Files.objects.get(pk=instance.pk).file
    except Files.DoesNotExist:
        return False