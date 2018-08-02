/*
Navicat PGSQL Data Transfer

Source Server         : petrovich
Source Server Version : 90606
Source Host           : 94.19.234.173:667
Source Database       : shizoid
Source Schema         : public

Target Server Type    : PGSQL
Target Server Version : 90606
File Encoding         : 65001

Date: 2018-03-22 06:17:09
*/


-- ----------------------------
-- Sequence structure for Chats_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."Chats_id_seq";
CREATE SEQUENCE "public"."Chats_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 1577
 CACHE 1;
SELECT setval('"public"."Chats_id_seq"', 1577, true);

-- ----------------------------
-- Sequence structure for Pairs_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."Pairs_id_seq";
CREATE SEQUENCE "public"."Pairs_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 22053130
 CACHE 1;
SELECT setval('"public"."Pairs_id_seq"', 22053130, true);

-- ----------------------------
-- Sequence structure for Replies_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."Replies_id_seq";
CREATE SEQUENCE "public"."Replies_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 32188944
 CACHE 1;
SELECT setval('"public"."Replies_id_seq"', 32188944, true);

-- ----------------------------
-- Sequence structure for Users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."Users_id_seq";
CREATE SEQUENCE "public"."Users_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 1
 CACHE 1;

-- ----------------------------
-- Sequence structure for Words_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."Words_id_seq";
CREATE SEQUENCE "public"."Words_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 1958880
 CACHE 1;
SELECT setval('"public"."Words_id_seq"', 1958880, true);
