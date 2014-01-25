# -*- coding: utf-8 -*-

from django.db import models


class Subdivision(models.Model):
    name = models.CharField(max_length=100, null=True)
    tel = models.CharField(max_length=30, null=False)


class Department(models.Model):
    name = models.CharField(max_length=45, null=True)
    tel = models.CharField(max_length=30, null=False)
    mail = models.CharField(max_length=45, null=False)
    subdivision = models.ForeignKey(Subdivision, null=False)


class Authors(models.Model):
    name = models.CharField(max_length=45, null=False)
    surname = models.CharField(max_length=45, null=True)
    patronymic = models.CharField(max_length=50, null=True)
    tel = models.CharField(max_length=30, null=True)
    mail = models.CharField(max_length=45, null=True)
    #TODO: добавить должность
    departments = models.ManyToManyField(Department)


class DocumentTypes(models.Model):
    type = models.CharField(max_length=45)


class IntellectualProperty(models.Model):
    name = models.CharField(max_length=45, null=False)
    type = models.ForeignKey(DocumentTypes)
    authors = models.ManyToManyField(Authors)


class Files(models.Model):
    path = models.CharField(max_length=200, null=False)
    name = models.CharField(max_length=45, null=False)
    intellectual_property_id = models.ForeignKey(IntellectualProperty, null=False)


class Tags(models.Model):
    tag = models.CharField(max_length=100, null=False)
    intellectual_properties = models.ManyToManyField(IntellectualProperty)
