'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  FileText,
  Target,
  Award,
  ArrowUp
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';

export default function HowItWorksPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await (supabase
        .from('email_leads') as any)
        .insert({
          email,
          source_page: 'how-it-works',
          lead_magnet: '5 KPIs Every HVAC Owner Must Track',
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already subscribed',
            description: 'This email is already on our list!',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Success!',
          description: 'Check your email for the free KPI guide.',
        });
        setEmail('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-secondary/20 animate-in fade-in duration-700">
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-heading font-bold leading-tight">
              Stop Guessing.
              <br />
              <span className="text-primary">Start Growing.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              See exactly how HVAC KPI Tracker helps you save 10+ hours per week,
              increase revenue per tech by 20%, and finally get control of your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/signup">Start 14-Day Free Trial</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required • Setup in 5 minutes • Cancel anytime
            </p>
          </div>
        </section>

        {/* Problem to Solution Section */}
        <section className="py-20 px-4 bg-background animate-in fade-in duration-700 delay-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold mb-4">
                The Problem Every HVAC Owner Faces
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                You're working harder than ever, but you can't see where time and money are slipping away.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Problems */}
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-bold text-destructive mb-6">Without KPI Tracking:</h3>

                <Card className="border-destructive/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">Lost Hours, Unknown Revenue Leaks</h4>
                        <p className="text-sm text-muted-foreground">
                          You know jobs are taking too long, but you can't pinpoint which ones or why.
                          Revenue per job varies wildly with no clear pattern.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">No Visibility Into Team Performance</h4>
                        <p className="text-sm text-muted-foreground">
                          Which techs are your top performers? Who needs training?
                          You're making scheduling decisions blind.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">Spreadsheet Chaos and Gut Decisions</h4>
                        <p className="text-sm text-muted-foreground">
                          Endless Excel files, outdated data, and business decisions based on
                          hunches instead of hard numbers.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Solutions */}
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-bold text-primary mb-6">With HVAC KPI Tracker:</h3>

                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">Crystal Clear Efficiency Insights</h4>
                        <p className="text-sm text-muted-foreground">
                          See exactly which jobs are profitable, which are dragging, and get
                          AI-powered recommendations to optimize workflow instantly.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">Real-Time Performance Dashboard</h4>
                        <p className="text-sm text-muted-foreground">
                          Track every technician's completion rates, revenue generation, and
                          efficiency scores. Make coaching decisions with confidence.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">Automated Tracking, Data-Driven Growth</h4>
                        <p className="text-sm text-muted-foreground">
                          No more spreadsheets. Just clean dashboards, automatic tracking,
                          and actionable insights that grow your bottom line.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/signup">See It In Action - Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section className="py-20 px-4 bg-secondary/30 dark:bg-secondary/20 animate-in fade-in duration-700 delay-300">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold mb-4">
                Measurable Results Within 14 Days
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real HVAC owners using our platform see tangible improvements fast.
              </p>
              <div className="mt-6 inline-block">
                <div className="bg-primary/10 dark:bg-primary/20 border-2 border-primary rounded-lg px-6 py-4">
                  <p className="text-lg font-semibold text-foreground">
                    HVAC companies using HVAC KPI Tracker save an average of 10+ hours per week per team.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-primary bg-card">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-5xl font-bold text-primary">10+</CardTitle>
                  <p className="text-muted-foreground">Hours Saved Per Week</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm">
                    Stop wasting time on manual tracking and chasing down job data.
                    Automated insights mean more time running your business.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary bg-card">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-5xl font-bold text-primary">20%</CardTitle>
                  <p className="text-muted-foreground">Revenue Increase Per Tech</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm">
                    Identify top performers, optimize scheduling, and reduce wasted hours.
                    More efficient techs = more jobs completed = more revenue.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary bg-card">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-5xl font-bold text-primary">80%</CardTitle>
                  <p className="text-muted-foreground">Fewer Scheduling Errors</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm">
                    Know exactly which techs are available and best suited for each job.
                    Reduce callbacks, improve first-time completion rates.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Card className="inline-block border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-lg mb-2">
                    <span className="font-bold">Average payback time:</span> Less than 1 week
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Most customers recover their subscription cost in the first 7 days through improved efficiency.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-20 px-4 bg-background animate-in fade-in duration-700 delay-500">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold mb-4">
                See exactly where your business is winning — and where time is leaking.
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                No complex software. No training required. Just clean, actionable insights.
              </p>
            </div>

            {/* Mock Dashboard Visual */}
            <Card className="overflow-hidden shadow-2xl mb-12">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <div className="bg-background rounded-lg p-6 shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Your KPI Dashboard</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Jobs Completed</p>
                      <p className="text-3xl font-bold">47</p>
                      <p className="text-xs text-green-600">+12% vs last week</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Avg Completion Time</p>
                      <p className="text-3xl font-bold">2.4h</p>
                      <p className="text-xs text-green-600">-18min improvement</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                      <p className="text-3xl font-bold">$18.2K</p>
                      <p className="text-xs text-green-600">+8% vs last week</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Tech Utilization</p>
                      <p className="text-3xl font-bold">87%</p>
                      <p className="text-xs text-green-600">+5% vs last week</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-3">Top Performers This Week</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mike Johnson</span>
                          <span className="text-sm font-semibold text-primary">12 jobs • $4.2K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Sarah Chen</span>
                          <span className="text-sm font-semibold text-primary">11 jobs • $3.9K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tom Rodriguez</span>
                          <span className="text-sm font-semibold text-primary">10 jobs • $3.5K</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-semibold mb-3">AI Recommendations</h4>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">Schedule Mike for complex repairs - 95% success rate</p>
                        </div>
                        <div className="flex gap-2">
                          <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">Consider adding tech capacity on Tuesdays (peak demand)</p>
                        </div>
                        <div className="flex gap-2">
                          <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">Avg job time down 15min - efficiency improvements working!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Real-Time Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  See performance metrics update live as jobs are completed throughout the day.
                </p>
              </div>
              <div>
                <FileText className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Export Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Download professional PDF and PNG reports to share with partners or use for planning.
                </p>
              </div>
              <div>
                <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Smart Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered suggestions on scheduling, training needs, and growth opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-secondary/30 dark:bg-secondary/20 animate-in fade-in duration-700 delay-700">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold mb-4">
                What HVAC Owners Are Saying
              </h2>
              <p className="text-xl text-muted-foreground">
                Real results from real businesses just like yours.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">JM</span>
                    </div>
                    <div>
                      <p className="font-semibold">James Martinez</p>
                      <p className="text-sm text-muted-foreground">Martinez HVAC (8 techs)</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    "We were losing money on jobs and didn't know why. Within two weeks of using
                    KPI Tracker, we identified scheduling inefficiencies and saved over $3,000 in
                    just the first month."
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">LT</span>
                    </div>
                    <div>
                      <p className="font-semibold">Lisa Thompson</p>
                      <p className="text-sm text-muted-foreground">Thompson Climate Control (12 techs)</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    "The ROI was instant. We could finally see which techs needed training and which
                    ones deserved bonuses. Our completion rates went up 25% in the first quarter."
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">RP</span>
                    </div>
                    <div>
                      <p className="font-semibold">Robert Patel</p>
                      <p className="text-sm text-muted-foreground">Patel & Sons HVAC (5 techs)</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    "As a small shop, every hour counts. This tool helped us go from chaos to clarity.
                    We're booking more jobs, finishing them faster, and actually growing for the first time in years."
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-background animate-in fade-in duration-700 delay-[900ms]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know before getting started.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">How long does setup take?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Most customers are up and running in under 5 minutes. Simply add your team members,
                  and you can start tracking jobs immediately. No complicated installation, no IT support needed.
                  Our onboarding wizard walks you through every step.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Do my technicians need training?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No training required. The interface is intuitive and designed specifically for busy HVAC teams.
                  Your techs can log jobs in seconds. Most teams are fully comfortable with the system within the first day.
                  We also provide quick-start video guides if needed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Can I cancel anytime?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. There are no long-term contracts or cancellation fees. You can cancel your subscription
                  at any time from your account settings with just one click. Your data remains accessible for 30 days
                  after cancellation in case you change your mind.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">What reports and analytics are included?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You get access to real-time dashboards showing job completion rates, technician performance,
                  revenue per job, average completion times, and more. Export professional reports in PDF or PNG format.
                  Higher-tier plans include historical trend analysis up to 1 year and AI-powered recommendations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">How does the free trial work?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Start your 14-day free trial with full access to all features - no credit card required.
                  You'll get email reminders before your trial ends. Only if you choose to continue will we ask for
                  payment information. There's zero risk and no surprise charges.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">What if I need help or have questions?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  All plans include email support with responses within 24 hours. Growth and Pro plans get priority support.
                  Pro plan customers receive dedicated support with faster response times. We also have a comprehensive
                  help center with guides, videos, and best practices.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Is my data secure?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. We use bank-level encryption and secure cloud infrastructure. Your data is backed up daily
                  and stored on enterprise-grade servers. We never share or sell your data to third parties.
                  You maintain full ownership of all your business information.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Lead Magnet Section */}
        <section className="py-20 px-4 bg-secondary/30 dark:bg-secondary/20 border-y animate-in fade-in duration-700 delay-[1100ms]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-heading font-bold mb-4">
                Free Guide: 5 KPIs Every HVAC Owner Must Track
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Not ready to start your free trial yet? Download our free guide and learn which
                metrics matter most for growing your HVAC business profitably.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Get Free Guide'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-3">
              No spam, ever. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 bg-background animate-in fade-in duration-700 delay-[1300ms]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Save Time and Grow Your Revenue?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of HVAC business owners who've taken control of their operations.
              Start your 14-day free trial today - no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/signup">Start Your Free Trial Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link href="/#pricing">View Pricing Plans</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
