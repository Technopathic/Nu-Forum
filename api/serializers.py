from rest_framework import serializers
from .models import Profile, Role, Category, Topic, Reply, Association
from django.contrib.auth.models import User

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = ('id', 'userID', 'avatar', 'roleID', 'ban', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class RoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = ('id', 'roleName', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class CategorySerializer(serializers.ModelSerializer):


    class Meta:
        model = Category
        fields = ('id', 'categoryName', 'categorySlug', 'categoryImage', 'categoryColor', 'categoryTextColor', 'categoryCount', 'created_at', 'updated_at')
        read_only_fields = ('updated_at')

class TopicSerializer(serializers.ModelSerializer):

    class Meta:
        model = Topic
        fields = ('id', 'userID', 'topicTitle', 'topicSlug', 'topicContent', 'topicViews', 'topicReplies', 'topicFeature', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class ReplySerializer(serializers.ModelSerializer):

    class Meta:
        model = Reply
        fields = ('id', 'userID', 'topicID', 'replyID', 'replyContent', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class AssociationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Association
        fields = ('id', 'categoryID', 'topicID', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
