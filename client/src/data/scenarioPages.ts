export interface ScenarioFaq {
  question: string;
  answer: string;
}

export interface RelatedLink {
  href: string;
  label: string;
}

export interface ScenarioData {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  snippetQuestion: string;
  snippetAnswer: string;
  whatsHappening: string[];
  isItLegal: string[];
  whatToDoNext: string[];
  dealerScript: string;
  ctaHeading: string;
  ctaBody: string;
  faqs: ScenarioFaq[];
  relatedLinks: RelatedLink[];
}

export const SCENARIO_PAGES: Record<string, ScenarioData> = {
  "dealer-raised-price-when-i-arrived": {
    slug: "dealer-raised-price-when-i-arrived",
    title: "Dealer Raised the Price When You Arrived \u2014 What It Means and What to Do",
    seoTitle: "Dealer Raised the Price When You Arrived \u2014 What to Do | Odigos",
    seoDescription: "The dealer quoted one price but it changed when you showed up. Learn why this happens, whether it's legal, and how to respond with the right questions.",
    snippetQuestion: "Why did the dealer raise the price when I arrived?",
    snippetAnswer: "Dealers sometimes quote a partial price \u2014 before taxes, fees, or add-ons \u2014 or use your presence on the lot as leverage to renegotiate. If the advertised price had no stated conditions, this may be a bait-and-switch tactic. Pull up the original communication and ask the dealer to explain exactly which line items changed and why.",
    whatsHappening: [
      "You received a price \u2014 online, over the phone, or by email \u2014 and drove to the dealership expecting that number. When you arrived, the figure was different. This is one of the most common complaints buyers report.",
      "There are two usual explanations. The first is that the price you were quoted was incomplete \u2014 it reflected the vehicle price alone, without taxes, documentation fees, registration, or add-ons. The second is that the dealer is treating your arrival as an opening to renegotiate, knowing that the time and effort you spent getting there makes it harder to walk away.",
      "In either case, the number changed after you showed up \u2014 and understanding why it changed determines what your best move is."
    ],
    isItLegal: [
      "If the advertised price had stated conditions \u2014 \u201cplus taxes and fees,\u201d \u201cwith approved credit,\u201d or \u201cafter trade-in\u201d \u2014 then the dealer has room to argue the final number was always going to be higher. Many advertised prices include conditions in the fine print.",
      "If the price was quoted with no conditions and the dealer refuses to honor it, that can cross into bait-and-switch territory. State consumer protection laws generally prohibit advertising a price with no intention of selling at that price, but enforcement depends on documentation.",
      "The practical question isn't usually whether it's technically illegal \u2014 it's whether you have a written quote that shows the original number. Written communication is your strongest protection."
    ],
    whatToDoNext: [
      "Pull up the original price you were given \u2014 email, text, ad screenshot, or online listing. Have it visible and ready to reference.",
      "Ask the dealer to explain specifically which line items changed. Don't accept a vague answer like \u201cthat was just the base price.\u201d Ask for the full out-the-door breakdown.",
      "If the dealer quoted a vehicle price and the increase is from taxes and fees, ask for a complete OTD total so you can evaluate the real cost.",
      "If the dealer quoted an OTD total and the number went up, ask what changed between the quote and today. If there's no satisfying explanation, you're within your rights to decline and leave.",
      "Don't feel pressure from having driven to the lot. The time you spent getting there doesn't obligate you to accept a different deal."
    ],
    dealerScript: "I have the price we discussed in writing at [X]. Can you walk me through specifically what changed and why the number is different today?",
    ctaHeading: "Want to check whether the new number adds up?",
    ctaBody: "Paste the quote or message you received. Odigos flags missing out-the-door pricing, hidden fees, and line items that weren't in the original conversation.",
    faqs: [
      {
        question: "Is an advertised price legally binding?",
        answer: "Generally, an advertised price is considered an invitation to negotiate, not a binding contract. However, if a dealer advertises a price with no conditions and refuses to honor it, that may violate state consumer protection laws against deceptive advertising. The strength of your position depends on how the price was communicated and whether conditions were stated."
      },
      {
        question: "What's the difference between the sale price and the out-the-door price?",
        answer: "The sale price is the vehicle cost before taxes and fees. The out-the-door price is the total you pay to leave the dealership \u2014 including sales tax, documentation fee, registration, title, and any add-ons. Always ask for the OTD price, because two dealers can quote the same sale price and have very different totals."
      },
      {
        question: "What if I drove a long distance to get to the dealership?",
        answer: "The distance you traveled doesn't change your negotiating position or your obligation. You aren't required to accept a deal just because you drove far. If the price changed, evaluate the new number on its own merits. If it doesn't work, it's better to leave than to accept a deal you weren't expecting."
      }
    ],
    relatedLinks: [
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/how-to-ask-for-out-the-door-price", label: "How to ask for the OTD price" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-changed-price-after-test-drive": {
    slug: "dealer-changed-price-after-test-drive",
    title: "Dealer Changed the Price After Your Test Drive \u2014 What\u2019s Going On",
    seoTitle: "Dealer Changed the Price After Test Drive \u2014 What to Do | Odigos",
    seoDescription: "The price went up after your test drive. Learn why dealers change numbers after you've driven the car, and how to get back to the original quote.",
    snippetQuestion: "Why did the dealer change the price after my test drive?",
    snippetAnswer: "A price increase after a test drive is a commitment escalation tactic. Once you've driven the car and shown interest, dealers know your emotional investment has increased. The price change tests whether you're too attached to walk away. Return to the number discussed before the drive and ask for a written OTD breakdown before continuing.",
    whatsHappening: [
      "You discussed a price, took the car for a test drive, came back \u2014 and the number shifted. This isn't a coincidence. It's a tactic based on how emotional buy-in works.",
      "Dealers are trained to read signals. Sitting behind the wheel, adjusting the mirrors, commenting on the features \u2014 these are all commitment indicators. Once the dealer sees you've connected with the vehicle, they know the leverage has shifted. Raising the price at this point is a test of how much you're willing to pay to avoid walking away from the car you just drove.",
      "The test drive itself doesn't change the value of the car or the deal. The only thing that changed is your level of attachment \u2014 and the dealer is pricing that in."
    ],
    isItLegal: [
      "A test drive doesn't create any obligation to buy. The price remains negotiable at every stage until you sign a purchase agreement.",
      "Changing the quoted price after a test drive is legal. It's a negotiation tactic, not a contractual violation. No verbal price discussed before a test drive is binding on either side.",
      "That said, if the dealer quoted a specific number in writing before the drive and is now presenting a higher one, you have a documented record of what was initially offered \u2014 and that's a reasonable starting point for the conversation."
    ],
    whatToDoNext: [
      "Separate how you feel about the car from the financial decision. The test drive is designed to make you want the car more \u2014 that's exactly the moment to focus on the numbers instead.",
      "Return to the price discussed before the drive. Ask: \u201cWe were discussing [X] before the test drive \u2014 what specifically changed about the deal since then?\u201d",
      "If the dealer claims the earlier number was a mistake or a starting point, ask for a written out-the-door breakdown at the original figure.",
      "If the new number is higher and the explanation is vague, you're seeing a pressure tactic. Decide based on whether the new total is a fair deal \u2014 not based on how much you liked driving the car."
    ],
    dealerScript: "I\u2019m interested in the vehicle, but I need to work from the same number we were discussing before the drive. What\u2019s the full out-the-door price at that figure?",
    ctaHeading: "Have the quote from before and after the drive?",
    ctaBody: "Paste what you received. Odigos compares the numbers and flags any changes to the price, fees, or add-ons between the two versions.",
    faqs: [
      {
        question: "Does a test drive obligate me to buy?",
        answer: "No. A test drive is a standard part of the shopping process and creates no legal or financial obligation. You can test drive a vehicle, decide it's not the right deal, and leave without purchasing anything."
      },
      {
        question: "What if the dealer says the pre-drive price was always higher?",
        answer: "If you have the earlier price in writing, reference it directly. If the discussion was verbal, the situation is harder to document \u2014 but you can still state what was discussed and ask the dealer to explain the discrepancy."
      },
      {
        question: "Can I still negotiate after the test drive?",
        answer: "Yes. Everything is negotiable until you sign the purchase contract. The test drive doesn't change your negotiating position unless you let the emotional attachment drive the decision."
      }
    ],
    relatedLinks: [
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
      { href: "/how-to-ask-for-out-the-door-price", label: "How to ask for the OTD price" },
    ],
  },

  "dealer-added-fees-after-deposit": {
    slug: "dealer-added-fees-after-deposit",
    title: "Dealer Added Fees After Your Deposit \u2014 What You Can Do",
    seoTitle: "Dealer Added Fees After Deposit \u2014 What You Can Do | Odigos",
    seoDescription: "New fees appeared after you paid a deposit on a car. Learn what a deposit does and doesn't lock in, and how to handle fees that weren't part of the original agreement.",
    snippetQuestion: "Can a dealer add fees after I paid a deposit?",
    snippetAnswer: "A deposit typically holds a vehicle \u2014 it doesn't lock in the full price unless you signed a written out-the-door agreement at the time. If new fees appeared after the deposit, the dealer may be capitalizing on the assumption that you won't walk away. Compare your original documentation to the current quote and ask for each new charge to be explained.",
    whatsHappening: [
      "You put down a deposit to secure a vehicle. Later \u2014 sometimes at pickup, sometimes in the finance office \u2014 new fees appeared that weren't part of the original conversation. Documentation fee, dealer prep, protection packages, or charges that simply weren't disclosed before.",
      "Deposits are designed to create commitment. Once you've paid one, there's a natural reluctance to walk away \u2014 the dealer understands this. Without a written out-the-door agreement at the time of the deposit, the remaining terms of the deal may still be open, and that's where fees can get added.",
      "Whether this is a communication gap or a deliberate tactic, the effect is the same: you're now being asked to pay more than what you understood when you committed."
    ],
    isItLegal: [
      "A deposit without a signed purchase agreement generally holds the car but doesn't constitute a final contract. That means the dealer may argue the full price was never finalized.",
      "However, adding undisclosed fees after a deposit may constitute an unfair or deceptive practice under FTC guidelines and state consumer protection laws \u2014 particularly if you have written evidence that a specific total was discussed.",
      "Whether you can recover a deposit if you decide to walk away depends on your state and what was written on the deposit receipt. Some deposits are refundable, some are not, and some are refundable within a specific window. Read the deposit paperwork carefully."
    ],
    whatToDoNext: [
      "Pull up whatever written documentation existed at the time of the deposit \u2014 the original quote, email, text, or receipt. Compare it line by line to the current numbers.",
      "Identify each new fee specifically. Ask the dealer to name the charge, explain what it covers, and confirm whether it was disclosed before the deposit was paid.",
      "If the fees were not discussed before the deposit, say so clearly and in writing. Ask for the fees to be removed or for the deal to return to the terms that were agreed to.",
      "If the dealer refuses, weigh whether the deal is still acceptable at the new total. If not, ask about your deposit refund options and consider other dealers."
    ],
    dealerScript: "These fees weren\u2019t part of what we discussed when I paid the deposit. I\u2019d like to see the quote from that point and compare it to what I\u2019m being asked to sign now. Can we reconcile the difference?",
    ctaHeading: "Want to see exactly what changed since the deposit?",
    ctaBody: "Paste both quotes \u2014 or just the current one. Odigos breaks down every line item and flags anything that doesn't match a standard out-the-door breakdown.",
    faqs: [
      {
        question: "Is my deposit refundable if I walk away?",
        answer: "It depends on your state and the terms of the deposit receipt. Some deposits are fully refundable, some are refundable within a certain time period, and some are non-refundable. Review the deposit paperwork for specific terms, and ask in writing if you're unsure."
      },
      {
        question: "What should I have in writing before paying a deposit?",
        answer: "Before paying any deposit, ask for a written out-the-door price that includes the vehicle price, all fees, taxes, registration, and any add-ons. A deposit without a written OTD agreement leaves the final price open to change."
      },
      {
        question: "Can a dealer add fees after a deposit even if they didn't mention them earlier?",
        answer: "Technically, if no signed purchase agreement existed, the deal terms may not have been finalized. But adding undisclosed fees after a deposit is a practice that raises serious consumer protection questions \u2014 and it's something you can push back on."
      }
    ],
    relatedLinks: [
      { href: "/dealer-changed-price-after-deposit", label: "Dealer changed the price after a deposit" },
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-wont-give-written-quote": {
    slug: "dealer-wont-give-written-quote",
    title: "Dealer Won\u2019t Give a Written Quote \u2014 What It Usually Means",
    seoTitle: "Dealer Won\u2019t Give a Written Quote \u2014 What to Do | Odigos",
    seoDescription: "The dealer will only quote you verbally and won't put it in writing. Learn why this happens, what it signals, and how to get the numbers you need.",
    snippetQuestion: "Why won't the dealer give me a written quote?",
    snippetAnswer: "A dealer who won't put a price in writing is protecting their ability to change it later. Written quotes create accountability. Verbal quotes don't. If a dealer avoids putting the out-the-door price in writing, it usually means the number they'd put on paper isn't as competitive as what they're willing to say out loud.",
    whatsHappening: [
      "You asked the dealer for a price \u2014 and they gave you one. But when you asked them to put it in writing, they hesitated, redirected, or suggested you come in to \u201cdiscuss it in person.\u201d",
      "This isn't unusual, and it isn't accidental. A verbal quote is flexible \u2014 it can be adjusted, denied, or reframed when you arrive. A written quote is a commitment that the dealer knows you'll hold them to.",
      "Dealers who have genuinely competitive pricing and a transparent sales process have no reason to avoid written quotes. The ones who do are typically managing a number they expect to adjust once they've assessed your willingness to pay in person."
    ],
    isItLegal: [
      "There's no law that requires a dealer to provide a written quote before you visit. It's a business practice, not a legal obligation.",
      "That said, refusal to quote in writing is widely understood in the car buying community as a signal that the final price will differ from the verbal one. Reputable dealerships routinely provide itemized out-the-door pricing by email, and many list pricing clearly online.",
      "If a dealer's explanation for refusing a written quote doesn't make sense to you \u2014 \u201cour system doesn't allow it,\u201d \u201cwe need to see the car first,\u201d \u201cwe don't do that over email\u201d \u2014 those are not industry-standard constraints. They're choices."
    ],
    whatToDoNext: [
      "Request the out-the-door price by email or text, specifically asking for vehicle price, documentation fee, taxes, registration, and any add-ons \u2014 each listed separately.",
      "If the dealer redirects you to a phone call or in-person visit, you can try once more: \u201cI'm comparing several dealers and I need written totals to make a decision. If you can send it, I\u2019ll include your quote in my comparison.\u201d",
      "If they still refuse, take that as useful information. A dealer who won't quote in writing is telling you something about how they operate.",
      "Consider reaching out to other dealerships selling the same vehicle. In most markets, you'll find at least one willing to provide a written OTD quote."
    ],
    dealerScript: "Before I visit, could you send the full out-the-door price in writing \u2014 vehicle price, all fees, taxes, and any add-ons? I\u2019m comparing quotes from a few dealers and I need the full number.",
    ctaHeading: "Have a verbal number you want to check?",
    ctaBody: "Even without a written quote, you can paste the details you were given. Odigos identifies what's missing from the quote and what you should ask for before going further.",
    faqs: [
      {
        question: "Why do some dealers refuse to give written quotes?",
        answer: "Written quotes create accountability. Once a number is in writing, the dealer is expected to honor it \u2014 or at least explain any deviation. Some dealers prefer verbal-only quotes so they can adjust the price when you arrive, based on your level of interest and willingness to walk away."
      },
      {
        question: "Is a verbal quote reliable?",
        answer: "A verbal quote is only as reliable as the dealer's willingness to honor it. Without documentation, the price can change for any reason when you arrive. Always try to get the out-the-door number in writing before visiting."
      },
      {
        question: "Can I negotiate before visiting the dealership?",
        answer: "Yes. Many buyers successfully negotiate the full deal by email or text before visiting. This approach gives you time to compare quotes, avoid high-pressure sales tactics, and arrive with a clear understanding of the deal."
      }
    ],
    relatedLinks: [
      { href: "/how-to-ask-for-out-the-door-price", label: "How to ask for the OTD price" },
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-only-gives-monthly-payment": {
    slug: "dealer-only-gives-monthly-payment",
    title: "Dealer Only Gives You a Monthly Payment Number \u2014 Not the Total Price",
    seoTitle: "Dealer Only Gives Monthly Payment, Not Total Price | Odigos",
    seoDescription: "The dealer will only talk monthly payments, not the total price. Learn why this tactic is used, what it hides, and how to redirect the conversation to the OTD total.",
    snippetQuestion: "Why does the dealer only give me a monthly payment instead of the total price?",
    snippetAnswer: "Monthly payment quoting lets dealers obscure the total cost of the deal. By adjusting loan term, interest rate, or down payment, a dealer can keep the monthly figure constant while increasing what you pay overall. You cannot evaluate a car deal from a monthly payment alone. Always ask for the out-the-door price, APR, and loan term separately.",
    whatsHappening: [
      "You asked for the price of a car. Instead of a total, you got a monthly payment: \u201c$489 a month.\u201d When you asked for the full number, you were redirected back to the monthly figure. The dealer may have even asked what monthly payment you\u2019re comfortable with.",
      "This is the most common way dealers keep you focused on a number you can psychologically accept while controlling variables you can\u2019t see. A monthly payment is a product of four things: vehicle price, interest rate, loan term, and down payment. The dealer can adjust any of those behind the scenes while keeping your payment in the same range.",
      "A $489 monthly payment over 60 months at 5% costs you a very different total than $489 over 84 months at 9%. The payment is the same. The cost is not."
    ],
    isItLegal: [
      "Quoting monthly payments is legal. It becomes a problem when it's the only information provided and the buyer is unable to evaluate the actual cost of the vehicle.",
      "Dealers are required to disclose financing terms \u2014 APR, loan term, and total financed amount \u2014 before you sign a contract. But during negotiation, there\u2019s no requirement to lead with the out-the-door total. Payment-focused quoting is a sales approach, not a compliance requirement.",
      "The practical risk is that you agree to a monthly figure without understanding the total cost, the interest rate, or how long you\u2019ll be paying. That\u2019s how buyers end up paying thousands more than they expected."
    ],
    whatToDoNext: [
      "Stop the monthly payment conversation. Say: \u201cI appreciate the monthly figure, but before we go further, I need the out-the-door price, the APR, and the loan term. Can you provide those three numbers?\u201d",
      "Don\u2019t share a target monthly payment. Once you tell a dealer what monthly payment you\u2019re comfortable with, they can reverse-engineer a deal that hits that number while maximizing their profit.",
      "Calculate the total cost yourself. Multiply the monthly payment by the number of months, add your down payment, and compare that to the OTD total. Any gap means money is being added somewhere.",
      "If the dealer refuses to provide the total price, APR, and loan term separately, consider that a signal. Transparent dealers have no reason to avoid these basic numbers."
    ],
    dealerScript: "I appreciate the payment breakdown, but I need to start with the total \u2014 what\u2019s the full out-the-door price, the APR, and the loan term you\u2019re using to get to that monthly figure?",
    ctaHeading: "Only got a monthly payment number?",
    ctaBody: "Paste whatever the dealer sent you. Odigos identifies what\u2019s missing from the quote \u2014 total price, rate, term, or hidden fees \u2014 and tells you what to ask for next.",
    faqs: [
      {
        question: "Can I calculate the total cost from a monthly payment?",
        answer: "Only if you know the APR, loan term, and down payment. Multiply the monthly payment by the number of months and add your down payment to get the total out-of-pocket cost. Compare that to the vehicle\u2019s out-the-door price \u2014 any gap means interest or fees are factored in."
      },
      {
        question: "Why do dealers prefer to quote monthly payments?",
        answer: "Because a monthly payment is a psychologically manageable number that's easy to accept. It hides the total cost, the interest rate, and the loan term \u2014 all of which determine what you actually pay. A $450/month payment can mean very different total costs depending on how the deal is structured."
      },
      {
        question: "Should I ever negotiate based on monthly payments?",
        answer: "Not before you have the out-the-door price, APR, and loan term confirmed in writing. Once those numbers are set, you can evaluate what the monthly payment looks like. But starting with the payment gives the dealer control of all the variables that determine your real cost."
      }
    ],
    relatedLinks: [
      { href: "/monthly-payment-trap", label: "The monthly payment trap explained" },
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-refuses-itemized-price": {
    slug: "dealer-refuses-itemized-price",
    title: "Dealer Refuses to Give an Itemized Price Breakdown \u2014 What to Do",
    seoTitle: "Dealer Won\u2019t Itemize the Price \u2014 What to Do | Odigos",
    seoDescription: "The dealer won't break down the total cost into individual charges. Learn why itemization matters, what it reveals, and how to get the breakdown you need.",
    snippetQuestion: "What should I do if the dealer refuses to itemize the price?",
    snippetAnswer: "An itemized breakdown is not a special request \u2014 it\u2019s standard in any car purchase. If a dealer won't separate the vehicle price, doc fee, taxes, registration, and add-ons into individual lines, something in the total likely doesn't hold up to scrutiny. Ask for the breakdown in writing, and if the dealer still refuses, consider it a red flag.",
    whatsHappening: [
      "You asked the dealer for a breakdown of the price \u2014 and instead of an itemized list, you got a single lump-sum total. Or worse, you were told \u201cthat\u2019s just what it is.\u201d",
      "Bundled pricing is not how car purchases are structured at the contract level. Every final purchase agreement must list the vehicle price, taxes, fees, and any products separately. When a dealer refuses to itemize before signing, they\u2019re preventing you from evaluating each charge on its own merits.",
      "The most common reason for refusing itemization is that one or more line items \u2014 typically add-ons or inflated fees \u2014 wouldn\u2019t look reasonable on their own. Bundled together, they\u2019re harder to question."
    ],
    isItLegal: [
      "The final purchase contract is required to itemize fees in most states. Refusing to show itemization during the negotiation phase isn\u2019t illegal, but it\u2019s a deliberate choice to limit your ability to negotiate.",
      "Federal and state consumer protection regulations expect transparency in pricing. A dealer who won\u2019t show you what you\u2019re paying for is choosing opacity over clarity \u2014 and that\u2019s worth noting.",
      "If you\u2019ve already reached the contract stage and the fees still aren\u2019t itemized, that\u2019s a more serious problem and potentially a violation of your state\u2019s disclosure requirements."
    ],
    whatToDoNext: [
      "Ask specifically: \u201cCan you show me the vehicle price, documentation fee, taxes, registration, and each add-on as separate line items?\u201d",
      "Request the breakdown in writing \u2014 by email or text. This creates a record and makes it harder for the dealer to give a vague answer.",
      "If the dealer says itemization isn\u2019t possible or \u201cthat\u2019s not how we do it,\u201d ask to speak with a manager. Every dealership can produce an itemized breakdown because they\u2019re required to do exactly that on the final contract.",
      "If itemization is still refused, walk away. A dealer who won\u2019t tell you what you\u2019re paying for is not operating transparently."
    ],
    dealerScript: "Before I can evaluate the deal, I need each charge listed separately \u2014 vehicle price, documentation fee, taxes, registration, and each add-on individually priced. Can you send that breakdown?",
    ctaHeading: "Have a lump-sum total you want broken down?",
    ctaBody: "Paste the quote you received. Odigos identifies what\u2019s missing, which standard line items aren\u2019t listed, and what to ask the dealer to disclose.",
    faqs: [
      {
        question: "Is a dealer required to give an itemized quote before I sign?",
        answer: "Not during negotiation, but the final purchase agreement must itemize fees in most states. If a dealer won\u2019t break down the numbers before you commit, they\u2019re limiting your ability to negotiate \u2014 and that\u2019s deliberate."
      },
      {
        question: "What charges should always be listed separately?",
        answer: "At minimum: the vehicle sale price, documentation fee, sales tax, title and registration fees, and each individual add-on or dealer-installed product. If any of these are missing, the quote is incomplete."
      },
      {
        question: "What if the dealer says the total can't be broken down?",
        answer: "Every dealership can itemize. The final purchase contract requires it. If a dealer tells you the total can\u2019t be broken down during negotiation, that\u2019s a choice \u2014 not a system limitation."
      }
    ],
    relatedLinks: [
      { href: "/car-dealer-fees-explained", label: "Common car dealer fees explained" },
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
    ],
  },

  "dealer-added-warranty-without-asking": {
    slug: "dealer-added-warranty-without-asking",
    title: "Dealer Added an Extended Warranty to Your Deal Without Asking",
    seoTitle: "Dealer Added Extended Warranty Without Asking | Odigos",
    seoDescription: "An extended warranty appeared in your car contract that you didn't agree to. Learn what 'packing' is, how to spot it, and how to get the warranty removed.",
    snippetQuestion: "What should I do if the dealer added an extended warranty I didn't ask for?",
    snippetAnswer: "Extended warranties are optional products. If one appeared in your contract without your explicit agreement, this is a practice called \u201cpacking\u201d \u2014 where the finance office inserts products into the deal before you review the numbers. Ask for the warranty to be removed and the total recalculated. Don\u2019t sign until the contract reflects only what you agreed to.",
    whatsHappening: [
      "You\u2019re reviewing the contract in the finance office and notice an extended warranty listed as a line item. You didn\u2019t ask for it. It may not have been discussed at all \u2014 or it may have been casually mentioned as \u201cincluded\u201d without a clear explanation of the cost.",
      "This is called \u201cpacking\u201d in the industry. It happens when the finance manager adds products to the deal before the buyer reviews the paperwork, often folded into the monthly payment so the buyer doesn\u2019t notice the individual charge.",
      "Extended warranties are among the highest-margin products in the finance office. Adding one without explicit agreement is common, and it\u2019s one of the reasons the out-the-door total in the finance office sometimes differs from what was agreed to on the sales floor."
    ],
    isItLegal: [
      "Adding a product to a contract without the buyer\u2019s agreement is problematic under FTC rules and most state consumer protection laws. If you didn\u2019t request the warranty and weren\u2019t told it was being added, you\u2019re not obligated to accept it.",
      "However, if the finance manager describes the warranty as \u201cincluded in your deal\u201d or part of the package and you don\u2019t push back before signing, the contract may be treated as accepted. This is why reviewing every line before signing is critical.",
      "If you\u2019ve already signed and want to remove the warranty, many states have a cancellation window \u2014 often 30 to 60 days \u2014 during which you can cancel the extended warranty for a full refund."
    ],
    whatToDoNext: [
      "Before signing: ask the finance manager to point out every product on the contract. If a warranty is there that you didn\u2019t request, ask for it to be removed immediately.",
      "Ask to see the monthly payment and total cost recalculated without the warranty. This reveals how much the warranty was actually adding to the deal.",
      "If you\u2019ve already signed: check your state\u2019s warranty cancellation rules. Most extended warranties can be cancelled within a defined window, and the cost should be refunded or credited to your loan.",
      "Compare the finance office total to what was agreed on the sales floor. If the numbers don\u2019t match, the warranty (or other products) is often the reason why."
    ],
    dealerScript: "I didn\u2019t request an extended warranty. Can you remove it from the contract and show me the revised total and monthly payment without it?",
    ctaHeading: "See something in your contract you didn\u2019t agree to?",
    ctaBody: "Paste your deal summary or contract details. Odigos identifies every line item and flags products that were added without clear agreement.",
    faqs: [
      {
        question: "Is an extended warranty worth buying?",
        answer: "It depends on the vehicle, the length of the manufacturer\u2019s warranty, and the cost of the extended coverage. For many buyers, the manufacturer\u2019s warranty provides sufficient coverage. If you do want an extended warranty, you can often purchase one later at a lower price than what the dealer charges."
      },
      {
        question: "Can I buy an extended warranty later instead of at the dealership?",
        answer: "Yes. Extended warranties can be purchased after the sale from third-party providers, and the cost is often lower than the dealer\u2019s price. You don\u2019t have to decide at the finance desk."
      },
      {
        question: "What is 'packing' in a car deal?",
        answer: "Packing is when the finance office adds products \u2014 warranties, GAP insurance, protection packages \u2014 to the deal without the buyer\u2019s explicit agreement, typically by folding the cost into the monthly payment so it\u2019s less visible."
      }
    ],
    relatedLinks: [
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
      { href: "/finance-office-changed-the-numbers", label: "Why the finance office numbers look different" },
    ],
  },

  "dealer-added-gap-insurance": {
    slug: "dealer-added-gap-insurance",
    title: "Dealer Added GAP Insurance You Didn\u2019t Ask For \u2014 What to Do",
    seoTitle: "Dealer Added GAP Insurance Without Asking | Odigos",
    seoDescription: "GAP insurance showed up in your car deal without your consent. Learn what GAP covers, when it's worth having, and how to remove it if you didn't agree to it.",
    snippetQuestion: "What should I do if the dealer added GAP insurance I didn't request?",
    snippetAnswer: "GAP insurance is optional. If it appeared in your contract without your agreement, ask for it to be removed and the total recalculated. If you do want GAP coverage, compare the dealer\u2019s price to what your lender or auto insurer charges \u2014 dealers typically mark it up significantly. You\u2019re never required to buy GAP through the dealership.",
    whatsHappening: [
      "GAP insurance covers the difference between what your car is worth and what you owe on the loan if the vehicle is totaled or stolen. For some buyers \u2014 particularly those with low down payments or long loan terms \u2014 it can be a useful product.",
      "The problem is how it gets into the deal. GAP is one of the most commonly added finance office products, and it\u2019s frequently inserted into the loan without a clear conversation. The cost \u2014 often $500 to $1,000 at the dealership \u2014 is folded into the monthly payment, making it invisible unless you review each line item.",
      "Many buyers don\u2019t realize GAP is in their contract until they\u2019re reviewing paperwork after the fact. And many don\u2019t know that the same coverage is available from their auto insurer or lender for a fraction of the dealer\u2019s price."
    ],
    isItLegal: [
      "GAP insurance is an optional product. Adding it to a contract without explicit buyer agreement raises the same consumer protection concerns as any undisclosed charge.",
      "If the finance manager presented it as \u201cpart of the deal\u201d or \u201crequired by the lender\u201d without disclosing the separate cost, that\u2019s a transparency issue. Lenders rarely require GAP \u2014 and when they do, it\u2019s typically noted in the loan approval terms, not added by the dealer.",
      "If you\u2019ve already signed, most GAP policies can be cancelled within a window defined by your state or the policy terms, with a full or prorated refund."
    ],
    whatToDoNext: [
      "Check your contract for a GAP insurance line item. Note the cost and whether it was discussed with you before the paperwork was presented.",
      "If it wasn\u2019t discussed or agreed to, ask for it to be removed and the total recalculated before signing.",
      "If you\u2019ve already signed: contact the dealer or GAP provider to cancel within the policy\u2019s cancellation window. The refund should be applied to your loan balance.",
      "If you do want GAP coverage, compare prices. Your auto insurer may offer GAP for $20\u2013$50 per year. Your lender may include it for a fraction of the dealer\u2019s price."
    ],
    dealerScript: "I didn\u2019t agree to GAP insurance. Please remove it from the contract and show me the updated total. If I decide I want it, I\u2019ll address it separately.",
    ctaHeading: "Not sure what\u2019s been added to your contract?",
    ctaBody: "Paste your deal breakdown. Odigos identifies each product and fee \u2014 including ones that may have been added without your clear agreement.",
    faqs: [
      {
        question: "Do I need GAP insurance?",
        answer: "If you\u2019re making a small down payment or financing for more than 60 months, GAP can be useful. If you\u2019re putting 20% or more down or have a shorter loan, you\u2019re less likely to owe more than the car is worth. Check your auto insurance policy \u2014 some already include GAP-like coverage."
      },
      {
        question: "Can I get GAP insurance cheaper than the dealer\u2019s price?",
        answer: "Usually, yes. Auto insurance companies and credit unions typically offer GAP coverage for significantly less than what dealers charge. Dealers often price GAP at $500\u2013$1,000, while insurers may charge $20\u2013$50 per year for equivalent coverage."
      },
      {
        question: "What happens if I decline GAP at the dealer?",
        answer: "Nothing. GAP is optional. Declining it at the dealership doesn\u2019t affect your loan approval, your interest rate, or your ability to purchase the vehicle. You can always add it later through your insurer or lender."
      }
    ],
    relatedLinks: [
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/finance-office-changed-the-numbers", label: "Why finance office numbers look different" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-added-nitrogen-tires": {
    slug: "dealer-added-nitrogen-tires",
    title: "Dealer Added a Nitrogen Tires Charge \u2014 Do You Have to Pay It?",
    seoTitle: "Dealer Added Nitrogen Tire Fee \u2014 Do You Have to Pay? | Odigos",
    seoDescription: "A nitrogen tire charge appeared on your car quote. Learn what nitrogen fill actually does, what the charge typically costs, and whether you can refuse it.",
    snippetQuestion: "Do I have to pay a dealer's nitrogen tire charge?",
    snippetAnswer: "No. Nitrogen-filled tires provide a marginal benefit over regular air in everyday driving conditions. The charge \u2014 typically $100 to $200 \u2014 is a dealer profit item added during pre-delivery prep. Even if the nitrogen has already been installed, the cost is negotiable and can be credited against the vehicle price.",
    whatsHappening: [
      "A line item for nitrogen tire fill appeared on your dealer quote or purchase contract, typically priced between $100 and $200. You didn\u2019t ask for it, and the dealer may be presenting it as either already installed or part of a standard prep package.",
      "Nitrogen fill is a common dealer add-on because it\u2019s inexpensive to perform and difficult for buyers to reverse. Dealers often fill tires with nitrogen during pre-delivery prep and then list the charge on the invoice as a done deal.",
      "The practical benefit of nitrogen over regular compressed air is minimal for normal driving. Nitrogen does maintain pressure slightly more consistently over time, but the difference is small enough that most tire experts consider it unnecessary for standard passenger vehicles."
    ],
    isItLegal: [
      "Nitrogen fill is an optional product. It\u2019s not required by any manufacturer or lender. If the dealer claims it\u2019s mandatory, ask them to show you where that requirement comes from.",
      "Even if the nitrogen has already been installed, the charge is negotiable. Physical installation doesn\u2019t create a contractual obligation to pay for it \u2014 the dealer made the choice to fill the tires, and the buyer is within their rights to ask for the charge to be removed.",
      "Nitrogen charges are generally too small to be the focus of a legal dispute, but they\u2019re a useful negotiating item and a signal that the dealer is layering profit into the deal through add-ons."
    ],
    whatToDoNext: [
      "Ask for the nitrogen charge to be removed from the quote. Say you didn\u2019t request it and you don\u2019t consider it part of the deal.",
      "If the dealer says it\u2019s already done and can\u2019t be reversed, ask for the charge to be credited against the vehicle price instead.",
      "If the nitrogen charge is part of a larger protection package, ask for the entire package to be itemized so you can evaluate each line separately.",
      "Don\u2019t let a small charge distract from the bigger picture. Focus on the out-the-door total and use the nitrogen charge as one element in a broader negotiation."
    ],
    dealerScript: "Can you remove the nitrogen tire charge, or apply it as a credit toward the vehicle price? It\u2019s not something I asked for and I\u2019d prefer regular air maintenance.",
    ctaHeading: "Not sure what\u2019s standard and what\u2019s extra on your quote?",
    ctaBody: "Paste your dealer quote. Odigos breaks down every line and flags add-ons like nitrogen fill, prep charges, and protection packages that are negotiable.",
    faqs: [
      {
        question: "Is nitrogen in tires actually better than regular air?",
        answer: "Nitrogen maintains pressure slightly more consistently over time because it has larger molecules than oxygen. However, for everyday driving, the practical difference is minimal. Regular air pressure checks achieve the same result for free."
      },
      {
        question: "Can I deflate the tires and refill with regular air?",
        answer: "Yes. There\u2019s no issue with refilling nitrogen-filled tires with regular compressed air. You don\u2019t need to maintain nitrogen fill after the purchase."
      },
      {
        question: "What other dealer prep fees are commonly added?",
        answer: "Common prep charges include dealer preparation fees, paint protection, fabric coating, VIN etching, and pin striping. Most are optional and negotiable, even when presented as standard or pre-installed."
      }
    ],
    relatedLinks: [
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/dealer-add-ons-list", label: "Full list of common dealer add-ons" },
      { href: "/car-dealer-fees-explained", label: "Car dealer fees explained" },
    ],
  },

  "dealer-added-vin-etching": {
    slug: "dealer-added-vin-etching",
    title: "Dealer Added a VIN Etching Charge \u2014 Is It Mandatory?",
    seoTitle: "Dealer Added VIN Etching \u2014 Is It Mandatory? | Odigos",
    seoDescription: "A VIN etching fee appeared on your dealer quote. Learn what VIN etching is, whether it prevents theft, and whether you can refuse the charge.",
    snippetQuestion: "Is a dealer's VIN etching charge mandatory?",
    snippetAnswer: "No. VIN etching \u2014 marking the vehicle identification number on windows as a theft deterrent \u2014 is an optional add-on. The fee, commonly $100 to $400, is not required by any manufacturer, lender, or state law. Even if the etching has already been done, the charge can be negotiated or credited against the vehicle price.",
    whatsHappening: [
      "VIN etching is the process of permanently marking the vehicle\u2019s identification number on one or more windows. Dealers present it as a theft deterrent \u2014 the idea being that a car with etched windows is harder to resell through illegal channels.",
      "The charge typically runs $100 to $400 on a dealer invoice, though the actual cost of the etching itself is significantly less. It\u2019s often done during pre-delivery prep and listed as a completed item, which gives the dealer room to argue it\u2019s non-removable.",
      "The theft-deterrent value of VIN etching is debated. Some studies suggest it may marginally reduce theft rates; others suggest the effect is negligible. Most comprehensive auto insurance policies cover stolen vehicles regardless of whether VIN etching was done."
    ],
    isItLegal: [
      "VIN etching is optional. No manufacturer requires it. No lender requires it. No state law requires it as a condition of purchase.",
      "If the dealer presents VIN etching as mandatory, ask for the specific law or policy that requires it. If they can\u2019t produce one, it\u2019s an optional charge presented as required.",
      "Even if the etching has already been physically applied, the cost is still negotiable. The dealer chose to perform the service before you agreed to it \u2014 that doesn\u2019t obligate you to pay for it."
    ],
    whatToDoNext: [
      "Ask for the VIN etching charge to be removed from the contract or credited against the vehicle price.",
      "If the dealer says it\u2019s required, ask for documentation. A written explanation of which law, lender policy, or manufacturer requirement mandates it.",
      "If you\u2019re told it\u2019s already been done and can\u2019t be removed, acknowledge that the etching is done but explain that the charge wasn\u2019t agreed to. Ask for a credit.",
      "Note that VIN etching kits are available for $25\u2013$30 retail. The dealer\u2019s markup on this service is typically very high relative to the cost of the product."
    ],
    dealerScript: "I didn\u2019t request VIN etching and I don\u2019t consider it part of our agreement. Please remove the charge from the contract or apply it as a credit to the vehicle price.",
    ctaHeading: "Want to know which charges on your quote are optional?",
    ctaBody: "Paste your dealer quote. Odigos identifies which items are standard fees and which are negotiable dealer add-ons like VIN etching.",
    faqs: [
      {
        question: "Does VIN etching actually prevent theft?",
        answer: "Evidence is mixed. Some insurance companies offer small premium discounts for etched vehicles, which suggests some recognized value. But most auto theft is covered by comprehensive insurance regardless, and the deterrent effect is limited for professional theft operations."
      },
      {
        question: "Is VIN etching required by any state?",
        answer: "No state requires VIN etching as a condition of vehicle purchase. Some states have specific rules about how VIN etching can be sold or presented, but none mandate it."
      },
      {
        question: "What other optional charges look like VIN etching on a dealer invoice?",
        answer: "Common similar charges include paint protection, fabric coating, nitrogen tire fill, and pin striping. These are all optional add-ons that dealers perform during prep and present as non-negotiable."
      }
    ],
    relatedLinks: [
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/dealer-add-ons-list", label: "Full list of common dealer add-ons" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-added-protection-package": {
    slug: "dealer-added-protection-package",
    title: "Dealer Added a Protection Package You Didn\u2019t Ask For \u2014 What It Includes and What to Do",
    seoTitle: "Dealer Added Protection Package Without Asking | Odigos",
    seoDescription: "A protection package appeared on your dealer quote or contract. Learn what's typically included, how dealers price them, and how to negotiate or remove the bundle.",
    snippetQuestion: "Can I refuse a dealer's protection package?",
    snippetAnswer: "Yes. Protection packages \u2014 bundles of paint sealant, fabric protection, and similar products \u2014 are optional even when presented as pre-installed or required. Dealers bundle these items to obscure individual pricing. Ask for each item to be priced separately. You can negotiate the full bundle down, remove it entirely, or ask for a credit against the vehicle price.",
    whatsHappening: [
      "A line item labeled \u201cprotection package,\u201d \u201cdealer protection,\u201d or \u201cappearance guard\u201d appeared on your quote or contract, typically priced at $500 to $1,500. Inside that bundle are several products \u2014 paint sealant, fabric coating, sometimes nitrogen fill, VIN etching, or wheel locks \u2014 all grouped under one price.",
      "Bundles exist for one reason: they prevent you from evaluating whether each item is worth the price. A $999 protection package sounds like a product; $199 paint sealant, $149 fabric spray, $89 nitrogen fill, and $249 VIN etching sounds like a markup.",
      "The products are often applied during pre-delivery prep. Dealers then present the bundle as something that\u2019s already been done and can\u2019t be removed \u2014 even though the charge itself is still negotiable."
    ],
    isItLegal: [
      "Protection packages are optional products. They are not required by any manufacturer, lender, or law. Even when already applied to the vehicle, the cost is negotiable.",
      "Bundling items together without disclosing individual prices limits your ability to evaluate the deal. While not illegal, it\u2019s a sales technique that reduces transparency.",
      "If the dealer claims the package is \u201crequired\u201d or \u201cpart of the deal,\u201d ask for written documentation of the requirement. In nearly all cases, the package is a dealer choice, not a purchase condition."
    ],
    whatToDoNext: [
      "Ask for the package to be broken down into individual items with separate pricing for each. This is the most effective way to evaluate whether any of the items are worth the cost.",
      "Ask for the full package to be removed. If the dealer says the products were already applied, ask for a credit equal to the package cost against the vehicle price.",
      "If you do want some of the items, negotiate each one separately. The total of individually priced items is almost always lower than the bundle price.",
      "Compare the dealer\u2019s pricing to retail costs. Many of these products \u2014 paint sealant, fabric protection \u2014 are available commercially for a fraction of what dealers charge."
    ],
    dealerScript: "Can you break down what\u2019s in the protection package and price each item separately? I didn\u2019t ask for this bundle and I\u2019d like to remove it from the deal unless each item is worth it individually.",
    ctaHeading: "Have a quote with a protection package you didn\u2019t request?",
    ctaBody: "Paste your quote. Odigos identifies what\u2019s in the bundle, what each item typically costs, and whether the package is optional.",
    faqs: [
      {
        question: "Are paint sealants worth the dealer\u2019s price?",
        answer: "Dealer-applied paint sealant is typically a polymer coating similar to products available at auto parts stores for $20\u2013$50. The dealer\u2019s charge is often $199\u2013$499 for a product that provides minimal additional protection beyond regular waxing."
      },
      {
        question: "What is fabric protection and does it work?",
        answer: "Fabric protection is a spray-on coating designed to resist stains on cloth seats. It has some utility, but it\u2019s essentially a scotchgard-type treatment. Commercial fabric protectors cost $10\u2013$20 and can be applied at home."
      },
      {
        question: "Can I negotiate a protection package after it\u2019s been applied?",
        answer: "Yes. The fact that the product was applied doesn\u2019t mean you\u2019re required to pay for it. The dealer chose to apply it before getting your agreement. You can ask for the charge to be removed or credited."
      }
    ],
    relatedLinks: [
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/dealer-add-ons-list", label: "Full list of common dealer add-ons" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-changed-price-before-signing": {
    slug: "dealer-changed-price-before-signing",
    title: "The Numbers Changed in the Finance Office Right Before Signing",
    seoTitle: "Dealer Changed Numbers Before Signing \u2014 What to Do | Odigos",
    seoDescription: "The price or terms changed between the sales floor and the finance office. Learn why this happens, what to check, and how to reconcile the numbers before signing.",
    snippetQuestion: "Why did the numbers change in the finance office before signing?",
    snippetAnswer: "Finance office numbers often differ from the sales floor because the F&I manager adds loan terms, optional products, and adjusted calculations. Monthly payments can shift due to changes in loan term, APR, or inserted add-ons. Always compare the finance office total line by line against what you agreed to on the sales floor. Don\u2019t sign until the numbers match.",
    whatsHappening: [
      "You agreed on a price with the salesperson. You shook hands, maybe felt good about the deal. Then you moved to the finance office \u2014 and the numbers on the paperwork don\u2019t match what was discussed.",
      "This is one of the most common sources of buyer frustration. The finance office is a separate stage of the deal, managed by a different person with different tools and incentives. The F&I manager\u2019s job is to finalize the contract, structure the loan, and present optional products \u2014 and all of those can change what the deal looks like.",
      "Changes between the sales floor and the finance office can include adjusted loan terms, a different interest rate, added products like warranties or GAP insurance, or rounding differences. Some of these are routine; others are deliberate."
    ],
    isItLegal: [
      "Nothing is binding until you sign the purchase agreement. Verbal agreements made on the sales floor are not contracts, and the dealer is within their rights to present different terms in the finance office.",
      "That said, you are equally within your rights to decline the new terms. You can refuse to sign, ask for the numbers to be corrected, or walk away entirely.",
      "Relying on buyer inertia at this stage \u2014 the assumption that you\u2019ve come too far to leave \u2014 is a documented tactic. Recognizing it gives you the freedom to act on the numbers, not the momentum."
    ],
    whatToDoNext: [
      "Before signing anything, compare every line item in the finance office paperwork against the number you agreed to on the sales floor.",
      "Check specifically: the vehicle price, the documentation fee, the interest rate (APR), the loan term (number of months), and whether any products were added (warranty, GAP, protection package).",
      "If anything differs, stop and ask: \u201cThis number is different from what we agreed on. Can you explain what changed?\u201d Get a specific answer for each line.",
      "If the finance office can\u2019t reconcile the numbers to your satisfaction, you are not obligated to sign. The deal is only final when you agree to the final terms."
    ],
    dealerScript: "These numbers don\u2019t match what we worked out on the floor. Before I sign anything, can we go through this line by line and reconcile the differences?",
    ctaHeading: "Want to compare the sales floor number to the finance office paperwork?",
    ctaBody: "Paste both versions of the deal \u2014 or just the finance office numbers. Odigos breaks down every line and flags anything that shifted.",
    faqs: [
      {
        question: "Can I refuse to sign if the numbers changed?",
        answer: "Yes. You have no obligation to sign a contract with terms that differ from what you agreed to. If the finance office numbers don\u2019t match the sales floor agreement, you can ask for them to be corrected or you can leave."
      },
      {
        question: "What is the four-square sales technique?",
        answer: "The four-square is a worksheet dealers use to negotiate vehicle price, trade-in value, monthly payment, and down payment simultaneously. By moving numbers between the four squares, the dealer can make one variable look better while adjusting others. It\u2019s not a contract \u2014 it\u2019s a negotiation tool."
      },
      {
        question: "What should I verify before signing in the finance office?",
        answer: "At minimum: the vehicle sale price, the APR, the loan term (number of payments), any added products and their individual costs, the documentation fee, and the total amount financed. Compare each to what was discussed on the sales floor."
      }
    ],
    relatedLinks: [
      { href: "/finance-office-changed-the-numbers", label: "Why the finance office numbers look different" },
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-pricing-tactics", label: "Common dealer pricing tactics" },
    ],
  },

  "dealer-increased-interest-rate": {
    slug: "dealer-increased-interest-rate",
    title: "Dealer Offered One Interest Rate, the Contract Shows a Higher One",
    seoTitle: "Dealer Increased Interest Rate in Contract | Odigos",
    seoDescription: "The interest rate in your car contract is higher than what was discussed. Learn what dealer rate markup is, how it works, and what to do about it.",
    snippetQuestion: "Why is the interest rate in my car contract higher than what the dealer quoted?",
    snippetAnswer: "Dealers can mark up the interest rate above what the lender approved \u2014 a practice called dealer reserve. The difference becomes dealer profit. This is legal in most states and rarely disclosed. The best protection is arriving with a pre-approved rate from your own bank or credit union and asking the dealer to match or beat it.",
    whatsHappening: [
      "During the sales conversation, a rate was mentioned \u2014 maybe 4.9%, maybe \u201csomething in the low fives.\u201d When the finance paperwork appeared, the APR was higher. Maybe 6.9%, maybe 7.5%. The payment was close enough that you almost didn\u2019t notice.",
      "This happens because of a practice called dealer reserve (or rate markup). When a dealer arranges financing through a lender, the lender approves a base rate \u2014 called the \u201cbuy rate.\u201d The dealer is allowed to offer the buyer a rate above the buy rate and keep the difference as profit.",
      "This means the rate you see in the contract may not be the best rate you qualified for. The difference can add hundreds or thousands of dollars over the life of the loan."
    ],
    isItLegal: [
      "Dealer rate markup is legal in most states. Lenders set a maximum markup they\u2019ll allow \u2014 typically 1\u20132 percentage points above the buy rate \u2014 and the dealer can quote anything within that range.",
      "Dealers are not required to disclose the buy rate or tell you the rate has been marked up. This lack of disclosure is why many buyers don\u2019t know the practice exists.",
      "Your most effective protection isn\u2019t regulation \u2014 it\u2019s having a competing rate. A pre-approved loan from your bank or credit union gives you a benchmark the dealer has to match or explain away."
    ],
    whatToDoNext: [
      "Get the APR confirmed in writing before signing. Ask: \u201cWhat is the exact APR on this contract?\u201d",
      "Calculate the total interest cost. Multiply the monthly payment by the number of months, subtract the amount financed, and compare the result to what you\u2019d pay at a lower rate.",
      "If you have a pre-approval from your own bank or credit union, present it. Say: \u201cI have a pre-approval at [X%]. Can you match or beat that rate?\u201d",
      "If the dealer\u2019s rate is higher than your pre-approval and they can\u2019t match it, use your own financing. You are not required to finance through the dealership."
    ],
    dealerScript: "The rate in this contract is higher than what we discussed. Can you confirm the rate the lender approved and whether there\u2019s any markup? I have a pre-approval at [X%] that I\u2019d like to use if you can\u2019t match it.",
    ctaHeading: "Not sure if the rate you\u2019re being offered is fair?",
    ctaBody: "Paste your deal details. Odigos reviews the terms \u2014 including the rate and loan structure \u2014 and flags anything that looks off.",
    faqs: [
      {
        question: "What is dealer reserve?",
        answer: "Dealer reserve is the difference between the lender\u2019s approved buy rate and the higher rate the dealer quotes you. The dealer keeps the spread as profit. For example, if the lender approved 4.5% and the dealer quotes 6.5%, the 2% difference is dealer reserve."
      },
      {
        question: "How much can a dealer mark up an interest rate?",
        answer: "Most lenders allow a markup of 1\u20132 percentage points above the buy rate. On a $30,000 loan over 60 months, a 2% markup adds roughly $1,500\u2013$1,800 in total interest."
      },
      {
        question: "Should I finance through the dealer or my own bank?",
        answer: "Start by getting pre-approved through your own bank or credit union. Then let the dealer try to beat or match that rate. If they can, great \u2014 if they can\u2019t, use your own financing. Having a competing rate is the single most effective way to protect yourself from rate markup."
      }
    ],
    relatedLinks: [
      { href: "/monthly-payment-trap", label: "The monthly payment trap" },
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/finance-office-changed-the-numbers", label: "Why finance office numbers look different" },
    ],
  },

  "dealer-added-market-adjustment-after-deposit": {
    slug: "dealer-added-market-adjustment-after-deposit",
    title: "Dealer Added a Market Adjustment Fee After You Paid a Deposit",
    seoTitle: "Market Adjustment Added After Deposit \u2014 What to Do | Odigos",
    seoDescription: "A market adjustment fee appeared after you already paid a deposit. Learn why this happens, whether you can push back, and what your options are for the deposit.",
    snippetQuestion: "Can a dealer add a market adjustment after I paid a deposit?",
    snippetAnswer: "If the market adjustment wasn\u2019t disclosed before the deposit, the dealer is adding a charge you didn\u2019t agree to. Whether you can contest this depends on what was in writing at the time of the deposit. Pull up your original communication, ask when the adjustment was decided, and decide whether to negotiate, accept, or request a deposit refund.",
    whatsHappening: [
      "You placed a deposit on a vehicle \u2014 possibly to hold it while it was being built or shipped, possibly on a high-demand model. At some point after the deposit, a market adjustment fee appeared: an amount above MSRP that the dealer is adding because of supply and demand conditions.",
      "Market adjustments are a dealer-set charge, not a manufacturer fee. They\u2019re most common on vehicles with limited inventory or high demand. When disclosed before any money changes hands, they\u2019re a known part of the deal.",
      "The issue is timing. If the market adjustment wasn\u2019t part of the conversation when you paid the deposit, the dealer is leveraging your financial commitment to introduce a new charge. That\u2019s a fundamentally different situation from disclosing it upfront."
    ],
    isItLegal: [
      "Market adjustments are legal \u2014 dealers are not required to sell at MSRP. But the legality of adding one after a deposit depends heavily on what was communicated and agreed to before the deposit was paid.",
      "If you have written communication showing a specific price or OTD total without a market adjustment, and the dealer is now adding one, that\u2019s a transparency problem and potentially a deceptive practice depending on your state\u2019s consumer protection laws.",
      "Whether your deposit is refundable if you decline the adjusted price depends on the terms of the deposit agreement. Some are fully refundable; others are not. Review the paperwork."
    ],
    whatToDoNext: [
      "Find the communication from when you paid the deposit. Was a market adjustment mentioned? Was a specific price quoted? Was there a written out-the-door total?",
      "Ask the dealer when the market adjustment was decided and why it wasn\u2019t disclosed before the deposit. Get their response in writing.",
      "If you want the vehicle: negotiate the adjustment amount. Market adjustments are entirely at the dealer\u2019s discretion, which means they can reduce or remove them.",
      "If the deal no longer works for you: ask about a full deposit refund. If the terms of the deposit say it\u2019s refundable and the dealer changed the price, you have a reasonable case for getting your money back."
    ],
    dealerScript: "The market adjustment wasn\u2019t part of what we discussed when I paid the deposit. I have our communication from that time. I\u2019d like to either proceed at the original price or discuss a refund of my deposit.",
    ctaHeading: "Has your deal changed since the deposit?",
    ctaBody: "Paste the current quote or communication. Odigos compares the terms and flags any changes \u2014 including fees that weren\u2019t in the original conversation.",
    faqs: [
      {
        question: "Is a market adjustment fee legal?",
        answer: "Yes. Dealers are not required to sell at MSRP and can set their own pricing. However, adding a market adjustment after a deposit was paid without disclosing it earlier raises transparency concerns and may be contestable depending on your state\u2019s consumer protection laws."
      },
      {
        question: "Can I get my deposit back if I don\u2019t accept the new price?",
        answer: "It depends on the terms of your deposit agreement. If the deposit is refundable and the dealer changed the price after you committed, you have a reasonable basis for requesting a full refund."
      },
      {
        question: "How do I negotiate a market adjustment?",
        answer: "Market adjustments are at the dealer\u2019s discretion \u2014 which means they\u2019re negotiable. Ask whether the adjustment can be reduced or removed. Check whether other dealers in the area are selling the same vehicle at MSRP. Having a competing offer is the strongest negotiating tool."
      }
    ],
    relatedLinks: [
      { href: "/market-adjustment-fee", label: "Market adjustment fees explained" },
      { href: "/dealer-changed-price-after-deposit", label: "Dealer changed the price after a deposit" },
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
    ],
  },

  "dealer-says-add-ons-required": {
    slug: "dealer-says-add-ons-required",
    title: "Dealer Says Add-Ons Are Required \u2014 What\u2019s Actually True",
    seoTitle: "Dealer Says Add-Ons Are Required \u2014 Are They? | Odigos",
    seoDescription: "The dealer says you have to buy their add-ons. Learn which add-ons are actually required, which aren't, and exactly what to say to push back.",
    snippetQuestion: "Are dealer add-ons actually required?",
    snippetAnswer: "In nearly all cases, no. Dealer add-ons like paint protection, fabric coating, nitrogen tires, and VIN etching are optional products, even when the dealer presents them as mandatory or pre-installed. No manufacturer, lender, or state law requires you to buy dealer-installed accessories. Ask the dealer to show you in writing where the requirement comes from.",
    whatsHappening: [
      "The dealer is telling you that certain add-ons \u2014 paint sealant, fabric protection, nitrogen tires, VIN etching, an appearance package \u2014 are required as part of the purchase. They may say it\u2019s dealer policy, part of the vehicle prep, or a condition of the sale.",
      "In nearly every case, this isn\u2019t true. These are optional dealer-installed products with high profit margins. The word \u201crequired\u201d is used to end the negotiation before it begins \u2014 if you believe the add-ons are mandatory, you won\u2019t try to remove them.",
      "Some dealers do have a policy of requiring add-ons on popular models as a condition of selling at MSRP. But a dealer policy is not a legal requirement \u2014 it\u2019s a business decision, and it\u2019s worth knowing the difference."
    ],
    isItLegal: [
      "Dealers cannot legally require buyers to purchase add-ons that weren\u2019t part of the advertised price \u2014 unless they clearly disclose the requirement in the advertisement.",
      "FTC and state consumer protection laws require dealers to disclose add-on costs separately from the vehicle price. Claiming add-ons are \u201crequired\u201d when they\u2019re not may constitute a deceptive trade practice.",
      "If the dealer\u2019s website or advertising lists a vehicle at a specific price without mentioning required add-ons, and the dealer then tells you the add-ons are mandatory, that\u2019s a gap between the advertised price and the selling conditions that raises consumer protection questions."
    ],
    whatToDoNext: [
      "Ask the dealer to show you in writing where the add-on is required \u2014 by the manufacturer, the lender, or state law. If they can\u2019t produce documentation, it\u2019s not required.",
      "If the dealer says it\u2019s \u201cdealer policy,\u201d acknowledge that \u2014 but note that dealer policy is not the same as a legal requirement. Ask whether the vehicle can be sold without the add-ons.",
      "If the add-ons were not mentioned in the advertisement or original price discussion, reference that: \u201cThe advertised price didn\u2019t include these add-ons. I\u2019d like to purchase the vehicle at the advertised price.\u201d",
      "If the dealer is firm, decide whether the deal still works with the add-ons included. If not, other dealers selling the same vehicle may not have the same policy."
    ],
    dealerScript: "Can you show me in writing where this add-on is required \u2014 whether that\u2019s by the lender, the manufacturer, or state law? If it\u2019s a dealer option, I\u2019d like to remove it from the deal.",
    ctaHeading: "Not sure which add-ons on your quote are actually required?",
    ctaBody: "Paste your dealer quote. Odigos identifies every add-on and tells you which are optional, which are standard, and which you can push back on.",
    faqs: [
      {
        question: "Can a dealer actually require add-ons?",
        answer: "A dealer can set a policy requiring add-ons as a condition of selling a vehicle, but it must be disclosed clearly. It\u2019s not a legal requirement \u2014 it\u2019s a business decision. If the add-ons weren\u2019t disclosed in the advertised price, you have grounds to push back."
      },
      {
        question: "What add-ons are legally required in a car purchase?",
        answer: "None. The only mandatory charges in a vehicle purchase are taxes, title, and registration \u2014 which are government-imposed, not dealer products. Everything the dealer adds is optional."
      },
      {
        question: "What if the dealer says the add-on is already installed?",
        answer: "Prior installation doesn\u2019t create an obligation to pay. The dealer chose to install it before getting your agreement. You can ask for the charge to be removed or credited against the vehicle price."
      }
    ],
    relatedLinks: [
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/dealer-add-ons-list", label: "Full list of common dealer add-ons" },
      { href: "/mandatory-dealer-add-ons", label: "Are add-ons really mandatory?" },
    ],
  },
};

export function getScenario(slug: string): ScenarioData | null {
  return SCENARIO_PAGES[slug] ?? null;
}

export const ALL_SCENARIO_SLUGS = Object.keys(SCENARIO_PAGES);
