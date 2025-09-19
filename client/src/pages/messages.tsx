import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageCircle, Plus, User, Mail } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMessageSchema } from "@shared/schema";
import type { Message, User as UserType, Property } from "@shared/schema";

const messageFormSchema = insertMessageSchema.omit({ senderId: true });

type MessageFormData = z.infer<typeof messageFormSchema>;

interface ConversationGroup {
  otherUser: UserType;
  property?: Property;
  messages: Message[];
  unreadCount: number;
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationGroup | null>(null);
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: () => apiRequest('/api/auth/user')
  });

  // Fetch user's messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
    queryFn: () => apiRequest('/api/messages')
  });

  // Fetch properties for new message form
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => apiRequest('/api/properties?limit=100')
  });

  // Form for new messages
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      propertyId: '',
      recipientId: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: MessageFormData) => apiRequest('/api/messages', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setIsNewMessageDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => apiRequest(`/api/messages/${messageId}/read`, 'PATCH'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });

  // Group messages by conversation
  const conversations: ConversationGroup[] = [];
  if (Array.isArray(messages)) {
    const messageGroups = new Map<string, Message[]>();
    
    (messages as Message[]).forEach((message: Message) => {
      const otherUserId = message.senderId === user?.id ? message.recipientId : message.senderId;
      const key = `${otherUserId}-${message.propertyId || 'general'}`;
      
      if (!messageGroups.has(key)) {
        messageGroups.set(key, []);
      }
      messageGroups.get(key)!.push(message);
    });

    // Convert to conversation groups (simplified for now)
    messageGroups.forEach((msgs, key) => {
      const sortedMsgs = msgs.sort((a, b) => 
        new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
      );
      const latestMsg = sortedMsgs[sortedMsgs.length - 1];
      const otherUserId = latestMsg.senderId === user?.id ? latestMsg.recipientId : latestMsg.senderId;
      
      // Create mock user data (in real app, would fetch from API)
      const otherUser: UserType = {
        id: otherUserId,
        email: `user${otherUserId.slice(-4)}@example.com`,
        firstName: 'User',
        lastName: otherUserId.slice(-4),
        role: 'agent' as const,
        profileImageUrl: null,
        phone: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const unreadCount = sortedMsgs.filter(m => 
        m.recipientId === user?.id && !m.isRead
      ).length;

      conversations.push({
        otherUser,
        messages: sortedMsgs,
        unreadCount
      });
    });
  }

  const handleSendMessage = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const handleSelectConversation = (conversation: ConversationGroup) => {
    setSelectedConversation(conversation);
    
    // Mark unread messages as read
    conversation.messages
      .filter(m => m.recipientId === user?.id && !m.isRead)
      .forEach(m => markAsReadMutation.mutate(m.id));
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with agents and buyers about properties
          </p>
        </div>
        <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-message">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property">
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No specific property</SelectItem>
                          {(properties as Property[]).map((property: Property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title} - {property.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter recipient user ID" 
                          {...field} 
                          data-testid="input-recipient-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Message subject" 
                          {...field} 
                          data-testid="input-subject"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inquiry Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-inquiry-type">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="viewing">Schedule Viewing</SelectItem>
                          <SelectItem value="offer">Make Offer</SelectItem>
                          <SelectItem value="information">Request Information</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your message here..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewMessageDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    data-testid="button-send"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6 h-full">
        {/* Conversations List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            {isLoading ? (
              <div className="p-4">
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 p-3">
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start by sending a message</p>
              </div>
            ) : (
              <div>
                {conversations.map((conversation, index) => (
                  <div
                    key={`${conversation.otherUser.id}-${index}`}
                    className={`p-4 border-b cursor-pointer hover-elevate ${
                      selectedConversation === conversation ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                    data-testid={`conversation-${conversation.otherUser.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={conversation.otherUser.profileImageUrl || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">
                            {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.messages[conversation.messages.length - 1]?.subject || 'No subject'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.messages[conversation.messages.length - 1]?.createdAt!)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.otherUser.profileImageUrl || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3>{selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {selectedConversation.otherUser.role}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                      data-testid={`message-${message.id}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.subject && (
                          <p className="font-medium text-sm mb-1">{message.subject}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className={`text-xs mt-2 opacity-70`}>
                          {formatTimestamp(message.createdAt!)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}