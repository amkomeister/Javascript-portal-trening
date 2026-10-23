export function art(kind) {
  const shapes = {
    robot:
      '<path d="M116 45h128v90H116z" fill="#2453db"/><path d="M180 24v21" stroke="#172b37" stroke-width="6"/><circle cx="180" cy="22" r="8" fill="#cbef57"/><rect x="99" y="70" width="17" height="40" rx="6" fill="#172b37"/><rect x="244" y="70" width="17" height="40" rx="6" fill="#172b37"/><rect x="135" y="65" width="90" height="35" rx="8" fill="#fff"/><circle cx="155" cy="82" r="8" fill="#172b37"/><circle cx="204" cy="82" r="8" fill="#172b37"/><path d="M160 116h40" stroke="#cbef57" stroke-width="6"/><path d="M75 32l7 10 12-4-7 10 7 10-12-4-7 10v-12l-12-5 12-4z" fill="#cbef57"/><text x="284" y="130" fill="#2453db" font-size="24" font-family="monospace">{ }</text>',
    pixel:
      '<g fill="#2453db"><path d="M140 24h20v20h-20zM220 24h20v20h-20zM160 44h60v20h-60zM120 64h140v60H120zM100 84h20v40h-20zM260 84h20v40h-20zM120 124h20v20h-20zM240 124h20v20h-20z"/></g><path d="M140 84h20v20h-20zM220 84h20v20h-20z" fill="#cbef57"/><path d="M160 124h60v20h-60z" fill="#f5f5ed"/>',
    motion:
      '<path d="M40 112H120M60 82h70M85 52h50" stroke="#172b37" stroke-width="6" stroke-linecap="round"/><circle cx="220" cy="82" r="52" fill="#2453db"/><circle cx="238" cy="70" r="10" fill="white"/><path d="M300 125l18-18 18 18M318 107v35" stroke="#172b37" stroke-width="5" fill="none"/>',
    website:
      '<rect x="72" y="20" width="216" height="126" rx="10" fill="white" stroke="#172b37" stroke-width="3"/><path d="M72 42h216" stroke="#172b37" stroke-width="2"/><circle cx="86" cy="31" r="3" fill="#2453db"/><circle cx="98" cy="31" r="3" fill="#2453db"/><path d="M90 58h115v12H90zM90 80h168v5H90zM90 94h75v35H90z" fill="#2453db"/><path d="M177 94h81v35h-81z" fill="#cbef57"/>',
    switch:
      '<rect x="95" y="50" width="170" height="70" rx="35" fill="#2453db"/><circle cx="228" cy="85" r="27" fill="#cbef57"/><path d="M156 124l-5-30 27 17-13 2-5 16z" fill="white" stroke="#172b37" stroke-width="3"/><path d="M283 48l16-10M278 30l5-17" stroke="#172b37" stroke-width="4"/>',
    target:
      '<circle cx="180" cy="85" r="65" fill="#2453db"/><circle cx="180" cy="85" r="45" fill="white"/><circle cx="180" cy="85" r="23" fill="#2453db"/><path d="M180 85l85-63M250 17l18 2-2 20" stroke="#172b37" stroke-width="6" fill="none"/><text x="55" y="120" font-size="25" fill="#172b37" font-family="monospace">+1</text>',
    snake:
      '<path d="M80 114h80V54h80v60h45" stroke="#2453db" stroke-width="27" fill="none" stroke-linejoin="round"/><circle cx="283" cy="109" r="4" fill="white"/><circle cx="300" cy="48" r="11" fill="#ec6c42"/><path d="M302 33l8-8" stroke="#172b37" stroke-width="4"/>',
    spark:
      '<path d="M180 12l18 48 53-14-30 42 38 38-56-4-23 39-17-48-54 14 32-43-41-35 58 2z" fill="#2453db"/><path d="M170 65l-15 16 15 16M193 65l15 16-15 16" stroke="#cbef57" stroke-width="5" fill="none"/>',
  };
  return (
    '<svg aria-hidden="true" viewBox="0 0 360 166" xmlns="http://www.w3.org/2000/svg">' +
    (shapes[kind] || shapes.spark) +
    '</svg>'
  );
}
