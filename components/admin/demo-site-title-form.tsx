"use client";

import { useEffect, useState } from "react";
import { useGalleryContext } from "@/components/admin/gallery-context";
import { COPYRIGHT_YEAR } from "@/lib/gallery-constants";
import { formatCopyright } from "@/lib/gallery-utils";
import {
  joinSiteTitleLines,
  parseSiteTitleLines,
  sanitizeSiteTitleLine,
  SITE_TITLE_LINE_MAX_LENGTH
} from "@/lib/site-title-utils";

export function DemoSiteTitleForm() {
  const { siteTitle, setSiteTitle } = useGalleryContext();
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const [nextLine1, nextLine2] = parseSiteTitleLines(siteTitle);
    setLine1(nextLine1);
    setLine2(nextLine2);
  }, [siteTitle]);

  const handleLineChange = (value: string, setter: (next: string) => void) => {
    setter(sanitizeSiteTitleLine(value));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSiteTitle(joinSiteTitleLines(line1, line2));
    setSavedMessage("サイトタイトルを保存しました。");
  };

  const previewTitle = joinSiteTitleLines(line1, line2);
  const [previewLine1, previewLine2] = parseSiteTitleLines(previewTitle);
  const previewCopyright = formatCopyright(previewTitle, COPYRIGHT_YEAR);

  return (
    <section className="adminPanel">
      <div className="adminPanelHeader">
        <div>
          <h2 className="adminPanelTitle">サイトタイトル</h2>
          <p className="adminMuted">
            デモギャラリー左上のタイトルと、右下の Copyright 表示に反映されます。
          </p>
        </div>
      </div>

      <form className="adminFormGrid" onSubmit={handleSubmit}>
        <label className="adminField adminFieldFull">
          <span>1行目（最大 {SITE_TITLE_LINE_MAX_LENGTH} 文字）</span>
          <input
            name="siteTitleLine1"
            type="text"
            value={line1}
            maxLength={SITE_TITLE_LINE_MAX_LENGTH}
            onChange={(event) => handleLineChange(event.target.value, setLine1)}
            placeholder="HIROKATSU SUZUKI PORTFOLIO"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="adminMuted">{line1.length}/{SITE_TITLE_LINE_MAX_LENGTH}</span>
        </label>

        <label className="adminField adminFieldFull">
          <span>2行目（最大 {SITE_TITLE_LINE_MAX_LENGTH} 文字）</span>
          <input
            name="siteTitleLine2"
            type="text"
            value={line2}
            maxLength={SITE_TITLE_LINE_MAX_LENGTH}
            onChange={(event) => handleLineChange(event.target.value, setLine2)}
            placeholder="WEB AND VISUAL COMMUNICATION"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="adminMuted">{line2.length}/{SITE_TITLE_LINE_MAX_LENGTH}</span>
        </label>

        <p className="adminMuted adminFieldFull">
          半角英数字・記号のみ入力できます。`&lt;` `&gt;` `&amp;` は使用できません。
        </p>

        <div className="adminSiteTitlePreview adminFieldFull">
          <p className="adminField">
            <span>プレビュー</span>
          </p>
          <div className="adminSiteTitlePreviewCard">
            <p className="adminSiteTitlePreviewHeading">
              {previewLine1}
              <br />
              {previewLine2}
            </p>
            <p className="adminMuted">{previewCopyright}</p>
          </div>
        </div>

        {savedMessage ? <p className="adminSuccess adminFieldFull">{savedMessage}</p> : null}

        <div className="adminActions">
          <button type="submit" className="adminPrimaryButton">
            タイトルを保存
          </button>
        </div>
      </form>
    </section>
  );
}
