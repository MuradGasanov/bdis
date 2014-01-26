# -*- coding: utf-8 -*-

from django.db import models


class Subdivision(models.Model):
    subdivision_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, null=True)
    tel = models.CharField(max_length=30, null=False)


class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=45, null=True)
    tel = models.CharField(max_length=30, null=False)
    mail = models.CharField(max_length=45, null=False)
    subdivision = models.ForeignKey(Subdivision, null=False)


class Authors(models.Model):
    author_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=45, null=False)
    surname = models.CharField(max_length=45, null=True)
    patronymic = models.CharField(max_length=50, null=True)
    tel = models.CharField(max_length=30, null=True)
    mail = models.CharField(max_length=45, null=True)
    post = models.CharField(max_length=100, null=True)
    department = models.ForeignKey(Department, null=True)


class DocumentTypes(models.Model):
    doc_type_id = models.AutoField(primary_key=True)
    doc_type = models.CharField(max_length=45)


class IntellectualProperty(models.Model):
    intellectual_property_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=45, null=False)
    doc_type = models.ForeignKey(DocumentTypes)
    authors = models.ManyToManyField(Authors)


class Files(models.Model):
    file_id = models.AutoField(primary_key=True)
    path = models.CharField(max_length=200, null=False)
    name = models.CharField(max_length=45, null=False)
    intellectual_property_id = models.ForeignKey(IntellectualProperty, null=False)


class Tags(models.Model):
    tag_id = models.AutoField(primary_key=True)
    tag = models.CharField(max_length=100, null=False)
    intellectual_properties = models.ManyToManyField(IntellectualProperty)
