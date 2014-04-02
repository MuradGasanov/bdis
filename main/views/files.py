# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


class Files():
    def __init__(self):
        pass

    @staticmethod
    def upload(request):
        """
        Привязывание файла к ИС
        """
        item = json.loads(request.POST.get("item"))
        intellectual_property = models.IntellectualProperty. \
            objects.get(intellectual_property_id=int(item["intellectual_property_id"]))
        f = request.FILES['files']
        new_file = models.Files.objects.create(
            file=f,
            name=f.name,
            size=f.size,
            extension=os.path.splitext(f.name)[1],
            intellectual_property=intellectual_property
        )  # .values("file_id", "name", "size", "extension")
        return HttpResponse(json.dumps({
            "file_id": new_file.file_id,
            "name": new_file.name,
            "size": new_file.size,
            "extension": new_file.extension
        }), content_type="application/json")

    @staticmethod
    def get_list(request):
        """
        Получить список файлов ИС
        """
        item = json.loads(request.POST.get("item"))
        files = list(
            models.Files.objects.all().
            filter(intellectual_property=item["intellectual_property_id"]).
            values("file_id", "name", "size", "extension", "file")
        )
        if files:
            return HttpResponse(json.dumps(files), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def delete(request):
        """
        Удаление файла
        """
        item = json.loads(request.POST.get("item"))
        for f in item:
            models.Files.objects.get(file_id=f["file_id"]).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def download(request):
        """
        Создание архива и его выгрузка
        """
        item = json.loads(request.POST.get("item"))
        intellectual_properties = models.IntellectualProperty.objects.filter(
            intellectual_property_id__in=item["files"])
        items = list(intellectual_properties.values("intellectual_property_id", "code", "name"))
        for item in items:
            files = models.Files.objects.filter(
                intellectual_property=item["intellectual_property_id"]).values_list("file", flat=True)
            files = map(
                lambda f: uni_path(os.path.join(settings.MEDIA_ROOT, f)),
                files
            )
            item["files"] = files

        zip_filename = "archive.zip"
        s = StringIO.StringIO()
        zf = zipfile.ZipFile(s, "w")
        for item in items:
            for file_path in item["files"]:
                f_dir, f_name = os.path.split(file_path)
                zip_path = os.path.join(
                    remove_illegal_chars("%s %s" % (item["code"], item["name"])),
                    f_name)
                zf.write(file_path, zip_path)
        zf.close()
        response = HttpResponse(s.getvalue(), content_type="application/x-zip-compressed")
        response['Content-Disposition'] = 'attachment; filename=%s' % zip_filename
        pass
        return response