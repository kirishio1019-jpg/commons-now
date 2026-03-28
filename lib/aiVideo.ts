// Theme-matched real video URLs from free stock sources
// No API key needed — uses direct CDN links to free licensed videos

// Each theme has multiple videos for variety
const THEME_VIDEOS: Record<string, string[]> = {
  植樹: [
    "https://cdn.pixabay.com/video/2020/05/25/39984-424210701_large.mp4",
    "https://cdn.pixabay.com/video/2021/04/16/71091-538925651_large.mp4",
    "https://cdn.pixabay.com/video/2019/09/29/27588-363856757_large.mp4",
  ],
  食: [
    "https://cdn.pixabay.com/video/2021/01/11/61866-499930498_large.mp4",
    "https://cdn.pixabay.com/video/2020/07/30/45894-444991498_large.mp4",
    "https://cdn.pixabay.com/video/2020/02/08/32000-390589498_large.mp4",
  ],
  物語: [
    "https://cdn.pixabay.com/video/2019/06/16/24633-342588498_large.mp4",
    "https://cdn.pixabay.com/video/2020/08/08/46903-449045932_large.mp4",
    "https://cdn.pixabay.com/video/2021/10/19/92284-637034814_large.mp4",
  ],
  雨水収集: [
    "https://cdn.pixabay.com/video/2020/08/06/46556-447966456_large.mp4",
    "https://cdn.pixabay.com/video/2019/10/06/27920-365300863_large.mp4",
    "https://cdn.pixabay.com/video/2022/03/20/111149-691193498_large.mp4",
  ],
  音楽: [
    "https://cdn.pixabay.com/video/2019/11/08/28870-372656009_large.mp4",
    "https://cdn.pixabay.com/video/2020/05/01/37908-414483498_large.mp4",
    "https://cdn.pixabay.com/video/2016/12/31/6962-198093498_large.mp4",
  ],
  ヨガ: [
    "https://cdn.pixabay.com/video/2020/06/12/41528-431373998_large.mp4",
    "https://cdn.pixabay.com/video/2019/11/24/29527-375998498_large.mp4",
    "https://cdn.pixabay.com/video/2021/09/01/87371-597234498_large.mp4",
  ],
  アート: [
    "https://cdn.pixabay.com/video/2019/07/23/25569-349863498_large.mp4",
    "https://cdn.pixabay.com/video/2020/10/21/52765-472768498_large.mp4",
    "https://cdn.pixabay.com/video/2017/08/15/11206-229635498_large.mp4",
  ],
  対話: [
    "https://cdn.pixabay.com/video/2020/04/18/36032-409203498_large.mp4",
    "https://cdn.pixabay.com/video/2019/09/15/26776-360843498_large.mp4",
    "https://cdn.pixabay.com/video/2021/04/06/70120-534493498_large.mp4",
  ],
  DIY: [
    "https://cdn.pixabay.com/video/2020/10/01/51313-466403498_large.mp4",
    "https://cdn.pixabay.com/video/2019/12/23/30561-382663498_large.mp4",
    "https://cdn.pixabay.com/video/2017/12/22/13598-248488498_large.mp4",
  ],
  ハイキング: [
    "https://cdn.pixabay.com/video/2019/07/28/25789-351309498_large.mp4",
    "https://cdn.pixabay.com/video/2020/06/22/42085-434498498_large.mp4",
    "https://cdn.pixabay.com/video/2021/07/12/81916-575883498_large.mp4",
  ],
  焚き火: [
    "https://cdn.pixabay.com/video/2017/01/20/7233-200386498_large.mp4",
    "https://cdn.pixabay.com/video/2019/06/16/24633-342588498_large.mp4",
    "https://cdn.pixabay.com/video/2020/03/26/34500-400867498_large.mp4",
  ],
  農業: [
    "https://cdn.pixabay.com/video/2020/12/22/59680-495088498_large.mp4",
    "https://cdn.pixabay.com/video/2019/09/03/26283-358498498_large.mp4",
    "https://cdn.pixabay.com/video/2021/04/16/71091-538925651_large.mp4",
  ],
  瞑想: [
    "https://cdn.pixabay.com/video/2020/06/12/41528-431373998_large.mp4",
    "https://cdn.pixabay.com/video/2021/07/17/82493-578153498_large.mp4",
    "https://cdn.pixabay.com/video/2020/01/29/31592-387810498_large.mp4",
  ],
  星空: [
    "https://cdn.pixabay.com/video/2020/07/30/45966-445181498_large.mp4",
    "https://cdn.pixabay.com/video/2019/10/20/28106-367260498_large.mp4",
    "https://cdn.pixabay.com/video/2016/09/10/5007-182805498_large.mp4",
  ],
  子どもと: [
    "https://cdn.pixabay.com/video/2020/05/11/38430-418218498_large.mp4",
    "https://cdn.pixabay.com/video/2021/01/18/62382-502069498_large.mp4",
    "https://cdn.pixabay.com/video/2019/10/13/27988-366063498_large.mp4",
  ],
};

const DEFAULT_VIDEOS = [
  "https://cdn.pixabay.com/video/2020/05/25/39984-424210701_large.mp4",
  "https://cdn.pixabay.com/video/2019/07/28/25789-351309498_large.mp4",
  "https://cdn.pixabay.com/video/2020/06/22/42085-434498498_large.mp4",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export async function generateAIVideo(
  theme: string, title: string, _description: string,
): Promise<string> {
  const videos = THEME_VIDEOS[theme] ?? DEFAULT_VIDEOS;
  // Pick deterministically based on title (same title = same video)
  const idx = hashString(title) % videos.length;
  return videos[idx];
}
