import { ReactComponent as UndoOutlined } from "@/assets/svg/undo.svg";
import { ReactComponent as ZoomInOutlined } from "@/assets/svg/zoom-in.svg";
import { ReactComponent as ZoomOutOutlined } from "@/assets/svg/zoom-out.svg";
import { ExtensionMessageEnum, WebviewMessageEnum } from "@/consts/enum";
import { ExtensionMessage } from "@/consts/interface";
import store from "@/store";
import { backgroundColorAtom } from "@/store/bgc";
import {
  filterDirListAtom,
  imageBasicInfoAtom,
  originDirListAtom,
} from "@/store/image";
import { svgEditorTargetAtom } from "@/store/modal";
import { getCompleteImagePath } from "@/utils";
import { App, Button, Modal, Space, Tag, Tooltip } from "antd";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markup";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Editor from "react-simple-code-editor";
import { toast } from "sonner";
import styles from "./index.module.less";

const MIN_SCALE = 0.25;
const MAX_SCALE = 16;

/** 解析校验SVG代码，返回错误信息（合法时返回null） */
const validateSvgCode = (code: string): string | null => {
  const doc = new DOMParser().parseFromString(code, "image/svg+xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    return errorNode.textContent || "parser error";
  }
  if (doc.documentElement.tagName.toLowerCase() !== "svg") {
    return "root element is not <svg>";
  }
  return null;
};

/** 去色时不替换的颜色值 */
const SKIP_COLOR_VALUES = ["none", "currentcolor", "inherit", "transparent"];
/** 需要处理的颜色属性 */
const COLOR_ATTRS = [
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
];

/** 判断一个颜色值是否应该被替换为currentColor */
const isReplaceableColor = (value: string): boolean => {
  const val = value.trim().toLowerCase();
  if (!val || SKIP_COLOR_VALUES.includes(val)) {
    return false;
  }
  // 渐变/图案引用、css变量不动
  if (val.startsWith("url(") || val.startsWith("var(")) {
    return false;
  }
  return true;
};

/** 将SVG中的颜色统一替换为currentColor（含内联style），解析失败返回null */
const decolorSvgCode = (code: string): string | null => {
  const doc = new DOMParser().parseFromString(code, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    return null;
  }
  doc.querySelectorAll("*").forEach((el) => {
    COLOR_ATTRS.forEach((attr) => {
      const value = el.getAttribute(attr);
      if (value && isReplaceableColor(value)) {
        el.setAttribute(attr, "currentColor");
      }
    });
    const style = el.getAttribute("style");
    if (style) {
      const newStyle = style.replace(
        /(fill|stroke|stop-color|flood-color|lighting-color)\s*:\s*([^;]+)/gi,
        (match, prop: string, value: string) =>
          isReplaceableColor(value)
            ? `${prop.toLowerCase()}:currentColor`
            : match
      );
      if (newStyle !== style) {
        el.setAttribute("style", newStyle);
      }
    }
  });
  return new XMLSerializer().serializeToString(doc.documentElement);
};

const SvgEditorModal = () => {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const [target, setTarget] = useAtom(svgEditorTargetAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);

  const [code, setCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [scale, setScale] = useState(1);
  const [previewUrl, setPreviewUrl] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  const targetRef = useRef(target);
  targetRef.current = target;

  const dirty = code !== originalCode;

  // 打开弹窗时读取SVG源码
  useEffect(() => {
    if (!target) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setScale(1);
    fetch(target.url)
      .then((res) => res.blob())
      .then((blob) => blob.text())
      .then((text) => {
        if (cancelled) {
          return;
        }
        setCode(text);
        setOriginalCode(text);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setLoading(false);
        toast.error(t("svg_load_failed"));
        setTarget(null);
      });
    return () => {
      cancelled = true;
    };
  }, [target, setTarget, t]);

  // 代码变化后防抖生成预览（blob url渲染，避免内联SVG执行脚本）
  useEffect(() => {
    if (!target) {
      return;
    }
    const timer = setTimeout(() => {
      setParseError(validateSvgCode(code));
      const blob = new Blob([code], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return url;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [code, target]);

  // 弹窗关闭时释放预览url
  useEffect(() => {
    if (!target && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // 保存后刷新列表中该图片的url（加时间戳破除缓存），使缩略图展示最新内容
  const bustImageCache = (completePath: string, name: string) => {
    const newUrlSuffix = `?v=${Date.now()}`;
    let oldUrl = "";
    [originDirListAtom, filterDirListAtom].forEach((targetAtom) => {
      store.set(targetAtom, (draft) => {
        const dir = draft.find((item) => item.completePath === completePath);
        const image = dir?.imageList.find((item) => item.name === name);
        if (image) {
          oldUrl = image.url;
          image.url = image.url.split("?")[0] + newUrlSuffix;
        }
      });
    });
    if (oldUrl) {
      store.set(imageBasicInfoAtom, (draft) => {
        delete draft[oldUrl];
      });
    }
  };

  // 接收扩展端返回的保存/优化结果
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message: ExtensionMessage = event.data;

      if (message.command === ExtensionMessageEnum.OptimizeSvgResult) {
        setOptimizing(false);
        // 优化期间弹窗被关闭则忽略结果
        if (!targetRef.current) {
          return;
        }
        if (message.success && message.data) {
          // 优化结果回填编辑器，用户确认预览后再保存
          setCode(message.data);
          toast.success(t("svg_optimize_success"));
        } else {
          toast.error(t("svg_optimize_failed"));
        }
        return;
      }

      if (message.command !== ExtensionMessageEnum.SaveSvgResult) {
        return;
      }
      const currentTarget = targetRef.current;
      if (
        !currentTarget ||
        message.completeSvgPath !==
          getCompleteImagePath(currentTarget.completePath, currentTarget.name)
      ) {
        return;
      }
      setSaving(false);
      if (message.success) {
        toast.success(t("svg_save_success"));
        bustImageCache(currentTarget.completePath, currentTarget.name);
        // 保存成功后关闭弹窗
        setTarget(null);
      } else {
        toast.error(t("svg_save_failed"));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  // 自动去色：颜色统一替换为currentColor
  const handleDecolor = () => {
    const result = decolorSvgCode(code);
    if (result === null) {
      toast.error(t("svg_invalid"));
      return;
    }
    setCode(result);
    toast.success(t("svg_decolor_success"));
  };

  // 一键优化：交给扩展端的SVGO处理
  const handleOptimize = () => {
    if (!target || optimizing || saving) {
      return;
    }
    const error = validateSvgCode(code);
    if (error) {
      setParseError(error);
      toast.error(t("svg_invalid"));
      return;
    }
    setOptimizing(true);
    VsCodeApi.postMessage({
      command: WebviewMessageEnum.OptimizeSvg,
      content: code,
    });
  };

  const handleSave = () => {
    if (!target || !dirty || saving || optimizing) {
      return;
    }
    const error = validateSvgCode(code);
    if (error) {
      setParseError(error);
      toast.error(t("svg_invalid"));
      return;
    }
    setSaving(true);
    VsCodeApi.postMessage({
      command: WebviewMessageEnum.SaveSvg,
      completeSvgPath: getCompleteImagePath(target.completePath, target.name),
      content: code,
    });
  };

  const handleCancel = () => {
    if (saving) {
      return;
    }
    if (!dirty) {
      setTarget(null);
      return;
    }
    modal.confirm({
      title: t("svg_unsaved_title"),
      content: t("svg_unsaved_content"),
      cancelText: t("cancel"),
      okText: t("confirm"),
      onOk: () => {
        setTarget(null);
      },
      centered: true,
    });
  };

  return (
    <Modal
      wrapClassName={styles.svgEditorModalWrapper}
      className={styles.svgEditorModal}
      open={!!target}
      title={
        <Space size={8}>
          <span>{t("edit_svg")}</span>
          <span className={styles.fileName} title={target?.name}>
            {target?.name}
          </span>
          {dirty && <Tag color="orange">{t("unsaved")}</Tag>}
        </Space>
      }
      footer={
        <div className={styles.footer}>
          <Space size={8}>
            <Tooltip title={t("svg_decolor_hint")}>
              <Button
                disabled={loading || saving || optimizing}
                onClick={handleDecolor}
              >
                {t("decolor")}
              </Button>
            </Tooltip>
            <Tooltip title={t("svg_optimize_hint")}>
              <Button
                loading={optimizing}
                disabled={loading || saving}
                onClick={handleOptimize}
              >
                {t("optimize")}
              </Button>
            </Tooltip>
          </Space>
          <Space size={8}>
            <Button
              disabled={!dirty || saving || optimizing}
              onClick={() => {
                setCode(originalCode);
              }}
            >
              {t("reset")}
            </Button>
            <Button
              type="primary"
              loading={saving}
              disabled={!dirty || loading || optimizing}
              onClick={handleSave}
            >
              {t("save")}
            </Button>
          </Space>
        </div>
      }
      onCancel={handleCancel}
      centered
      destroyOnClose={false}
    >
      <div
        className={styles.content}
        onKeyDownCapture={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            handleSave();
          }
        }}
      >
        {/* 左侧代码编辑区 */}
        <div className={styles.editorPane}>
          <Editor
            className={styles.editor}
            value={code}
            onValueChange={setCode}
            disabled={loading}
            highlight={(code) =>
              highlight(code, languages.markup, "markup")
                .split("\n")
                .map((line) => (line === "" ? "<br>" : line))
                .join("\n")
            }
            padding={12}
            textareaClassName={styles.editorTextarea}
          />
        </div>

        {/* 右侧实时预览区 */}
        <div className={styles.previewPane}>
          <div className={styles.previewToolbar}>
            <ZoomOutOutlined
              className={clsx(
                styles.toolbarIcon,
                scale <= MIN_SCALE && styles.disabled
              )}
              onClick={() => {
                setScale((prev) => Math.max(MIN_SCALE, prev / 2));
              }}
            />
            <span className={styles.scaleText}>{Math.round(scale * 100)}%</span>
            <ZoomInOutlined
              className={clsx(
                styles.toolbarIcon,
                scale >= MAX_SCALE && styles.disabled
              )}
              onClick={() => {
                setScale((prev) => Math.min(MAX_SCALE, prev * 2));
              }}
            />
            <UndoOutlined
              className={styles.toolbarIcon}
              onClick={() => {
                setScale(1);
              }}
            />
          </div>
          <div
            className={styles.previewBox}
            style={{
              backgroundColor:
                typeof backgroundColor === "string"
                  ? backgroundColor
                  : backgroundColor?.toRgbString(),
            }}
          >
            {previewUrl && !parseError && (
              <img
                className={styles.previewImage}
                src={previewUrl}
                alt={target?.name}
                style={{ transform: `scale(${scale})` }}
              />
            )}
            {parseError && (
              <div className={styles.parseError} title={parseError}>
                {t("svg_invalid")}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SvgEditorModal;
