# Generated by Django 5.0.6 on 2024-06-04 11:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userdata', '0004_rename_profile_picture_snapshot_avatar_url_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='snapshot',
            name='date',
            field=models.DateField(auto_now_add=True, verbose_name='Date Saved'),
        ),
    ]
