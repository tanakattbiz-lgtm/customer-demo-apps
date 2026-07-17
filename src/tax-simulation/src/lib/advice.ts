// AIアドバイス生成(デモ用: 計算結果からルールベースで文章を組み立てる)
import type {
  SaleInput, SaleResult,
  InheritanceInput, InheritanceResult,
  GiftInput, GiftResult,
  RentalInput, RentalResult,
} from "./tax";
import { man } from "./tax";

const pct = (r: number) => (r * 100).toFixed(1) + "%";

export function saleAdvice(i: SaleInput, r: SaleResult): string {
  const lines: string[] = [];
  lines.push(
    `売却価格${man(i.salePrice)}に対する税負担は${man(r.totalTax)}(実効税率${pct(r.effectiveRate)})、手取り額は約${man(r.netProceeds)}と試算されました。`
  );
  if (r.usedEstimatedCost) {
    lines.push(
      `取得費が不明なため売却価格の5%(${man(r.acquisitionCost)})で概算しています。当時の売買契約書や住宅ローンの記録が見つかれば取得費を実額で計上でき、税額を大幅に下げられる可能性があります。まず書類の捜索をおすすめします。`
    );
  }
  if (!r.isLongTerm) {
    lines.push(
      `所有期間${i.holdingYears}年のため短期譲渡(税率39.63%)が適用されています。所有期間が5年を超えると長期譲渡(20.315%)となり税率がほぼ半分になります。売却時期を見直せる場合は、譲渡した年の1月1日時点で5年超となるタイミングの検討が有効です。`
    );
  }
  if (i.isResidence && r.specialDeduction > 0) {
    lines.push(
      `居住用財産の3,000万円特別控除により${man(r.specialDeduction)}が控除されています。適用には「住まなくなってから3年目の年末までの売却」等の要件があるため、期限にご注意ください。`
    );
  }
  if (!i.isResidence && r.taxableGain > 0) {
    lines.push(
      `ご自宅の売却であれば3,000万円特別控除で税額を大きく減らせる可能性があります。賃貸中の物件でも、事業用資産の買換え特例など別の制度が使える場合があります。`
    );
  }
  if (r.lightRateApplied) {
    lines.push(
      `所有期間10年超のため軽減税率(6,000万円以下の部分14.21%)が適用されています。`
    );
  }
  lines.push(
    `譲渡所得の申告は売却翌年の確定申告(2/16〜3/15)で行います。特例の適用可否は要件確認が重要なため、不動産税務に強い税理士への相談をおすすめします。`
  );
  return lines.join("\n\n");
}

export function inheritanceAdvice(
  i: InheritanceInput,
  r: InheritanceResult
): string {
  const lines: string[] = [];
  if (r.taxableEstate === 0) {
    lines.push(
      `正味遺産額${man(r.netAssets)}は基礎控除(${man(r.basicDeduction)})の範囲内のため、このシミュレーションでは相続税はかからない見込みです。ただし生命保険金・死亡退職金・生前贈与の持ち戻し等で課税財産が増える場合があるため、財産の棚卸しは一度行っておくと安心です。`
    );
  } else {
    lines.push(
      `相続税の総額は約${man(r.totalTax)}(正味遺産額に対して${pct(r.effectiveRate)})と試算されました。基礎控除${man(r.basicDeduction)}を超える部分${man(r.taxableEstate)}が課税対象です。`
    );
    if (i.hasSpouse && r.spouseRelief > 0) {
      lines.push(
        `配偶者の税額軽減により約${man(r.spouseRelief)}が軽減されています。ただし配偶者に財産を寄せすぎると、二次相続(配偶者が亡くなった際の相続)で子の税負担が重くなる「二次相続問題」があります。一次・二次をトータルで設計するのが重要です。`
      );
    }
    lines.push(
      `対策の代表例として、(1)暦年贈与(年110万円まで非課税)の計画的な活用、(2)小規模宅地等の特例(自宅土地の評価額を最大80%減額)、(3)生命保険の非課税枠(500万円×法定相続人)の活用、が挙げられます。不動産をお持ちの場合は評価方法によって税額が大きく変わるため、相続に強い税理士による財産評価をおすすめします。`
    );
  }
  lines.push(
    `相続税の申告期限は相続開始から10か月以内です。不動産の名義変更(相続登記)は義務化されているため、司法書士への相談も併せてご検討ください。`
  );
  return lines.join("\n\n");
}

export function giftAdvice(i: GiftInput, r: GiftResult): string {
  const lines: string[] = [];
  if (r.totalTax === 0) {
    lines.push(
      `年間${man(i.amount)}の贈与は基礎控除110万円の範囲内のため、贈与税はかかりません。毎年の暦年贈与を続けることで、相続財産を計画的に圧縮できます。`
    );
    lines.push(
      `ただし「毎年同額を同時期に贈与する」と定期贈与とみなされ一括課税されるリスクがあります。贈与契約書を毎回作成し、金額や時期を変えるなどの工夫をおすすめします。`
    );
  } else {
    lines.push(
      `年間${man(i.amount)}の贈与に対する贈与税は約${man(r.totalTax)}(実効税率${pct(r.effectiveRate)}、適用税率${pct(r.rate)})と試算されました。受贈者の手取りは約${man(r.netReceived)}です。`
    );
    if (!i.isSpecial) {
      lines.push(
        `一般税率で計算しています。父母・祖父母から18歳以上の子・孫への贈与であれば特例税率が適用され、税額が下がる可能性があります。`
      );
    }
    lines.push(
      `税負担を抑える選択肢として、(1)複数年に分割して基礎控除を毎年使う、(2)相続時精算課税制度(累計2,500万円まで贈与時非課税+年110万円基礎控除)、(3)住宅取得資金や教育資金の非課税特例、の検討が挙げられます。どの制度が有利かは相続財産全体とのバランスで決まるため、税理士への相談をおすすめします。`
    );
  }
  lines.push(
    `贈与税の申告は贈与を受けた翌年の2/1〜3/15です。振込記録と贈与契約書を残しておくことがトラブル防止につながります。`
  );
  return lines.join("\n\n");
}

export function rentalAdvice(i: RentalInput, r: RentalResult): string {
  const lines: string[] = [];
  lines.push(
    `給与収入${man(i.salaryIncome)}+家賃収入${man(i.rentIncome)}の場合、年間の税額(所得税+住民税)は約${man(r.totalTax)}と試算されました。うち不動産所得による増加分は約${man(r.additionalTax)}です。`
  );
  if (!i.blueDeduction) {
    lines.push(
      `青色申告特別控除(最大65万円)が未適用です。事業的規模(おおむね5棟10室以上)で複式簿記により申告すれば、課税所得を65万円圧縮できます。適用税率${pct(r.marginalRate)}なら年間約${man(650_000 * (r.marginalRate + 0.1))}の節税効果が見込めます。`
    );
  } else {
    lines.push(
      `青色申告特別控除65万円を適用済みです。加えて、家族への給与(青色事業専従者給与)や小規模企業共済の活用でさらに課税所得を圧縮できる可能性があります。`
    );
  }
  const expenseRatio = i.rentIncome > 0 ? i.expenses / i.rentIncome : 0;
  if (expenseRatio < 0.15 && i.rentIncome > 0) {
    lines.push(
      `経費率が${pct(expenseRatio)}と低めです。減価償却費・管理委託料・固定資産税・損害保険料・修繕費・借入金利息(建物分)など、計上漏れがないか確認をおすすめします。特に減価償却費は計上漏れが多い項目です。`
    );
  }
  if (r.marginalRate >= 0.23) {
    lines.push(
      `適用税率が${pct(r.marginalRate)}に達しています。規模拡大をお考えの場合、法人化(資産管理会社の設立)により税率を一定に抑えられる可能性があります。一般に課税所得900万円前後が法人化検討の目安とされます。`
    );
  }
  lines.push(
    `不動産所得が年20万円を超える給与所得者は確定申告が必要です。申告や法人化の判断は前提条件で大きく変わるため、不動産投資に強い税理士への相談をおすすめします。`
  );
  return lines.join("\n\n");
}
